using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Theater_booking.Data;
using Theater_booking.Models;
using Theater_booking.Services;

namespace Theater_booking.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly OTPService _otpService;

        public AuthController(AppDbContext context, IConfiguration configuration, OTPService otpService)
        {
            _context = context;
            _configuration = configuration;
            _otpService = otpService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest();

            var otp = _otpService.GenerateOTP();

            await _otpService.SendOTPEmail(dto.Email, otp);
            _otpService.CacheOtp(dto.Email, otp);

            var hasher = new PasswordHasher<User>();
            var hashedPassword = hasher.HashPassword(null, dto.Password);

            var tempUser = new OTPService.TempUser
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = hashedPassword
            };
            _otpService.CacheTempUser(dto.Email, tempUser);

            return Ok(new { message = "OTP sent to your email" });
        }
[HttpPost("resend")]
public async Task<IActionResult> ResendOtp([FromBody] ResendDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.Email))
        return BadRequest(new { message = "Email is required." });

    try
    {
        var otp = _otpService.GenerateOTP();
        await _otpService.SendOTPEmail(dto.Email, otp);
        _otpService.CacheOtp(dto.Email, otp);

        return Ok(new { message = "OTP resent to your email" });
    }
    catch (FormatException)
    {
        return BadRequest(new { message = "Invalid email format" });
    }
}

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyDto dto)
        {
            var isOtpValid = _otpService.VerifyOtp(dto.Email, dto.Otp);
            if (!isOtpValid)
                return BadRequest(new { message = "Invalid or expired OTP" });

            var tempUser = _otpService.GetTempUser(dto.Email);
            if (tempUser == null)
                return BadRequest(new { message = "User data expired, please register again" });

            var user = new User
            {
                FirstName = tempUser.FirstName,
                LastName = tempUser.LastName,
                Email = tempUser.Email,
                PasswordHash = tempUser.PasswordHash,
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _otpService.RemoveTempUser(dto.Email);

            return Ok(new { message = "Email verified and account created successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return BadRequest(new { message = "Invalid credentials" });

            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result != PasswordVerificationResult.Success)
                return BadRequest(new { message = "Invalid credentials" });

            var token = GenerateJwtToken(user);

            Response.Cookies.Append("access_token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new
            {
                user = new { user.UserId, user.FirstName, user.LastName, user.Email },
                token
            });
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ResendDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { message = "Email is required." });

            // 🔍 تأكد إن الإيميل موجود في قاعدة البيانات
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return BadRequest(new { message = "No account associated with this email." });

            try
            {
                var otp = _otpService.GenerateOTP();
                await _otpService.SendOTPEmail(dto.Email, otp);
                _otpService.CacheOtp(dto.Email, otp);

                return Ok(new { message = "OTP sent to your email" });
            }
            catch (FormatException)
            {
                return BadRequest(new { message = "Invalid email format" });
            }
        }

        [HttpPost("verify-reset")]
        public IActionResult VerifyResetOtp([FromBody] VerifyDto dto)
        {
            var isOtpValid = _otpService.VerifyOtp(dto.Email, dto.Otp);
            if (!isOtpValid)
                return BadRequest(new { message = "Invalid or expired OTP" });

            return Ok(new { message = "OTP verified. You can now reset your password." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return BadRequest(new { message = "User not found" });

            var hasher = new PasswordHasher<User>();
            user.PasswordHash = hasher.HashPassword(user, dto.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successful" });
        }


        private string GenerateJwtToken(User user)
        {
            var jwtSecret = _configuration["Jwt:Secret"]
                ?? throw new ArgumentNullException("Jwt:Secret", "JWT Secret is missing");

            var key = Encoding.ASCII.GetBytes(jwtSecret);
            var tokenHandler = new JwtSecurityTokenHandler();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.GivenName, user.FirstName),
                    new Claim(ClaimTypes.Surname, user.LastName)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }

        public class RegisterDto
        {
            public required string FirstName { get; set; }
            public required string LastName { get; set; }
            public required string Email { get; set; }
            public required string Password { get; set; }
        }

        public class LoginDto
        {
            public required string Email { get; set; }
            public required string Password { get; set; }
        }

        public class VerifyDto
        {
            public required string Email { get; set; }
            public required string Otp { get; set; }
        }
        public class ResendDto
        {
            [Required]
            public string Email { get; set; }
        }
        public class ForgotPasswordDto
        {
            public required string Email { get; set; }
        }

        public class ResetPasswordDto
        {
            public required string Email { get; set; }
            public required string Otp { get; set; }
            public required string NewPassword { get; set; }
        }

    }
}
