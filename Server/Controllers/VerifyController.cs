using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Theater_booking.Data;
using Theater_booking.Models;

namespace Theater_booking.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VerifyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VerifyController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("check")]
        public async Task<IActionResult> VerifyTicket([FromQuery] Guid ticketCode)
        {
            var ticket = await _context.Tickets
                .Include(t => t.User)
                .Include(t => t.Show)
                .FirstOrDefaultAsync(t => t.TicketCode == ticketCode);

            if (ticket == null)
                return NotFound("❌ Invalid Ticket");

            if (ticket.IsScanned)
                return BadRequest("⚠️ Ticket already used");

            ticket.IsScanned = true;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "✅ Ticket is valid and checked in",
                ticket.TicketCode,
                UserName = $"{ticket.User.FirstName} {ticket.User.LastName}",
                ticket.User.UserId,
                ShowDate = ticket.Show.Day,
                Seats = ticket.SeatsDescription,
                ticket.User.Email,
            });
        }
    }
}
