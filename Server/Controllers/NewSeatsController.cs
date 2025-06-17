using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Theater_booking.Data;
using Theater_booking.Models;

namespace Theater_booking.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewSeatsController  : ControllerBase
    {
        private readonly AppDbContext _context;

        public NewSeatsController (AppDbContext context)
        {
            _context = context;
        }

        // GET: api/seats
[HttpGet("structured")]
public async Task<ActionResult<object>> GetSeats(int Show2Id)
{
    var bookedSeatIds = await _context.NewSeatReservations
        .Where(sr => sr.Reservation.Show2Id == Show2Id && sr.Reservation.Status != ReservationStatus.Rejected)
        .Select(sr => sr.SeatId)
        .ToListAsync();

    var allSeats = await _context.NewSeats
        .OrderBy(s => s.Section)
        .ThenByDescending(s => s.Row)
        .ThenBy(s => s.Number)
        .ToListAsync();

    var grouped = allSeats
        .GroupBy(s => s.Section)
        .ToDictionary(
            sectionGroup => sectionGroup.Key,
            sectionGroup => sectionGroup
                .GroupBy(s => s.Row)
                .OrderByDescending(g => g.Key)
                .ToDictionary(
                    rowGroup => rowGroup.Key,
                    rowGroup => rowGroup
                        .OrderBy(s => s.Number)
                        .Select(s => new
                        {
                            s.Id,
                            s.Row,
                            s.Number,
                            s.Position,
                            s.Price,
                            s.Section,
                            SeatCode = s.SeatCode,
                            IsBooked = bookedSeatIds.Contains(s.Id)
                        })
                        .ToList()
                )
        );

    return Ok(grouped);
}

[HttpPost("book")]
public async Task<IActionResult> BookReservation([FromBody] NewBookSeatsRequest  request)
{
    var bookedSeatIds = await _context.NewSeatReservations
        .Where(sr => sr.Reservation.Show2Id == request.Show2Id
            && sr.Reservation.Status != ReservationStatus.Rejected)
        .Select(sr => sr.SeatId)
        .ToListAsync();

    var alreadyBooked = request.SeatIds.Intersect(bookedSeatIds).ToList();
    if (alreadyBooked.Any())
    {
        return BadRequest(new
        {
            success = false,
            message = "بعض الكراسي محجوزة بالفعل",
            alreadyBooked
        });
    }

        var reservation = new Reservation
        {
            UserId = request.UserId,
            Show2Id = request.Show2Id, // ← كويس
            BookedAt = DateTime.UtcNow,
            Status = ReservationStatus.Pending
        };


    foreach (var seatId in request.SeatIds)
    {
        reservation.NewSeatReservations.Add(new NewSeatReservation
        {
            SeatId = seatId
        });
    }

    _context.Reservations.Add(reservation);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        success = true,
        message = "تم الحجز بنجاح",
        reservationId = reservation.ReservationId,
        bookingStartTime = reservation.BookedAt
    });
}

        [HttpGet("reservation/{reservationId}")]
        public async Task<IActionResult> GetReservationDetails(int reservationId)
        {
            var reservation = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Show)
                .Include(r => r.SeatReservations)
                    .ThenInclude(sr => sr.Seat)
                .FirstOrDefaultAsync(r => r.ReservationId == reservationId);

            if (reservation == null)
            {
                return NotFound(new { success = false, message = "الحجز غير موجود" });
            }

            // حساب السعر الكلي
            var totalPrice = reservation.SeatReservations.Sum(sr => sr.Seat.Price);

            return Ok(new
            {
                fullName = $"{reservation.User.FirstName} {reservation.User.LastName}",
                day = reservation.Show2.Day,
                bookedAt = reservation.BookedAt,
                seats = reservation.SeatReservations.Select(sr => new
                {
                    seatCode = sr.Seat.SeatCode,
                    price = sr.Seat.Price
                }),
                totalPrice = totalPrice,
                status = reservation.Status.ToString(),
            });
        }

        public class NewBookSeatsRequest 
        {
            public int UserId { get; set; }
            public int Show2Id { get; set; }
            public List<int> SeatIds { get; set; } = new List<int>();
        }

    }
}
