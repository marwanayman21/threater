using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Theater_booking.Data;
using Theater_booking.Models;

namespace Theater_booking.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]  // كل العمليات هنا تتطلب توكن مصدق
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            return Ok(new {
                user.UserId,
                user.FirstName,
                user.LastName,
                user.Email,
            });
        }

        // ممكن تضيف هنا تحديث بيانات المستخدم، حذف، وغيره حسب الحاجة
    }
}
