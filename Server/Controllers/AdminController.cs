using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Theater_booking.Data;
using Theater_booking.Models;
using Theater_booking.Services;

namespace Theater_booking.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public AdminController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet("reservations/pending")]
        public async Task<IActionResult> GetPendingReservations()
        {
            var pendingReservations = await _context.Reservations
                .Where(r => r.Status == ReservationStatus.Pending)
                .Include(r => r.User)
                .Include(r => r.Show)
                .Include(r => r.Show2)
                .Include(r => r.SeatReservations)
                    .ThenInclude(sr => sr.Seat)
                .ToListAsync();

            var grouped = pendingReservations
                .GroupBy(r => new { r.UserId, r.ShowId, r.Show2Id, r.BookedAt })
                .Select(g =>
                {
                    var first = g.First();
                    return new
                    {
                        id = first.ReservationId,
                        status = first.Status.ToString(),
                        userName = $"{first.User.FirstName} {first.User.LastName}",
                        userId = first.User.UserId,
                        showDate = first.Show2 != null ? first.Show2.Day : first.Show.Day,
                        seats = g.SelectMany(r => r.SeatReservations).Select(sr => sr.Seat.SeatCode).Distinct(),
                        totalPrice = g.SelectMany(r => r.SeatReservations).Sum(sr => sr.Seat.Price),
                        email = first.User.Email,
                        requestDate = first.BookedAt.ToString("yyyy-MM-dd")
                    };
                })
                .ToList();

            return Ok(grouped);
        }

        [HttpPut("reservation/{reservationId}/status")]
        public async Task<IActionResult> UpdateReservationStatus(int reservationId, [FromQuery] string status)
        {
            if (!Enum.TryParse<ReservationStatus>(status, true, out var newStatus))
            {
                return BadRequest(new { success = false, message = "حالة غير صالحة" });
            }

            var reservation = await _context.Reservations
                .FirstOrDefaultAsync(r => r.ReservationId == reservationId);

            if (reservation == null)
                return NotFound(new { success = false, message = "الحجز غير موجود" });

            var reservationsToUpdate = await _context.Reservations
                .Where(r =>
                    r.UserId == reservation.UserId &&
                    r.BookedAt == reservation.BookedAt &&
                    r.ShowId == reservation.ShowId &&
                    r.Show2Id == reservation.Show2Id)
                .ToListAsync();

            if (newStatus == ReservationStatus.Rejected)
            {
                _context.Reservations.RemoveRange(reservationsToUpdate);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "تم رفض الحجز وحذفه بنجاح" });
            }
            else if (newStatus == ReservationStatus.Approved)
            {
                foreach (var res in reservationsToUpdate)
                    res.Status = newStatus;

                var seatCodes = await _context.SeatReservations
                    .Where(sr => reservationsToUpdate.Select(r => r.ReservationId).Contains(sr.ReservationId))
                    .Include(sr => sr.Seat)
                    .Select(sr => sr.Seat.SeatCode)
                    .ToListAsync();

                var ticket = new Ticket
                {
                    TicketCode = Guid.NewGuid(),
                    UserId = reservation.UserId,
                    SeatsDescription = string.Join(", ", seatCodes),
                    ShowId = reservation.ShowId,
                    Show2Id = reservation.Show2Id
                };

                await _context.Tickets.AddAsync(ticket);
                await _context.SaveChangesAsync();

                var user = await _context.Users.FindAsync(reservation.UserId);
                if (user != null)
                {
                    try
                    {
                        await _emailService.SendTicketEmailAsync(user.Email, $"{user.FirstName} {user.LastName}", ticket.TicketCode);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("خطأ أثناء إرسال الإيميل: " + ex.Message);
                    }

                    return Ok(new
                    {
                        success = true,
                        message = "تم الموافقة على الحجز وتوليد التذكرة بنجاح",
                        ticketId = ticket.TicketCode
                    });
                }

                return BadRequest(new { success = false, message = "لا يمكن تنفيذ هذه العملية بهذه الحالة" });
            }

            return BadRequest(new { success = false, message = "حالة غير معروفة" });
        }
    }
}
