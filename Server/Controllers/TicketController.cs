using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Theater_booking.Data;
using Theater_booking.Models;

namespace Theater_booking.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTicketsByUser([FromQuery] int userId)
        {
            var tickets = await _context.Tickets
                .Include(t => t.User)
                .Include(t => t.Show)
                .Include(t => t.Show2)
                .Where(t => t.User.UserId == userId)
                .ToListAsync();

            if (tickets == null || !tickets.Any())
                return NotFound("No tickets found for this user.");

            return Ok(tickets.Select(ticket => new
            {
                ticket.TicketCode,
                ticket.IsScanned,
                Seat = ticket.SeatsDescription,
                showDay = ticket.Show != null ? ticket.Show.Day : ticket.Show2?.Day,
                User = $"{ticket.User.FirstName} {ticket.User.LastName}"
            }));
        }

        [HttpPost("scan/{ticketCode}")]
        public async Task<IActionResult> ScanTicket(Guid ticketCode)
        {
            var ticket = await _context.Tickets
                .Include(t => t.User)
                .Include(t => t.Show)
                .Include(t => t.Show2)
                .FirstOrDefaultAsync(t => t.TicketCode == ticketCode);

            if (ticket == null)
                return NotFound("Ticket not found.");

            if (ticket.IsScanned)
                return BadRequest("Ticket already scanned.");

            ticket.IsScanned = true;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "✅ Ticket scanned successfully.",
                ticketCode = ticket.TicketCode,
                seatsDescription = ticket.SeatsDescription,
                showDay = ticket.Show != null ? ticket.Show.Day : ticket.Show2?.Day,
                user = new
                {
                    fullName = $"{ticket.User.FirstName} {ticket.User.LastName}",
                    email = ticket.User.Email
                }
            });
        }
    }
}
