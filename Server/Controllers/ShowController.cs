using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Theater_booking.Data;
using Theater_booking.Models;

namespace Theater_booking.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShowController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ShowController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllShows()
        {
            var shows = await _context.Shows
                .Select(s => new
                {
                    Id = s.ShowId,
                    Day = s.Day
                })
                .ToListAsync();

            return Ok(shows);
        }
    }
}