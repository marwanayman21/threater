using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Theater_booking.Data;
using Theater_booking.Models;

namespace Theater_booking.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Show2Controller : ControllerBase
    {
        private readonly AppDbContext _context;

        public Show2Controller(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllShows()
        {
            var shows = await _context.Set<Show2>()
                .Select(s => new
                {
                    Id = s.Show2Id,
                    Day = s.Day,
                })
                .ToListAsync();

            return Ok(shows);
        }
    }
}