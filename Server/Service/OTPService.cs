using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Theater_booking.Services
{
    public class OTPService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<OTPService> _logger;
        private readonly IMemoryCache _cache;

        private readonly TimeSpan _otpExpiry = TimeSpan.FromMinutes(5);

        public OTPService(IConfiguration config, ILogger<OTPService> logger, IMemoryCache cache)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        }

        public string GenerateOTP()
        {
            return new Random().Next(100000, 999999).ToString();
        }

public async Task SendOTPEmail(string email, string otp)
{
    if (string.IsNullOrWhiteSpace(email))
        throw new ArgumentException("Email cannot be null or empty", nameof(email));

    var smtpSettings = _config.GetSection("SmtpSettings");
    var fromEmail = smtpSettings["FromEmail"] ?? throw new ArgumentNullException("SmtpSettings:FromEmail is not configured");
    var password = smtpSettings["Password"] ?? throw new ArgumentNullException("SmtpSettings:Password is not configured");
    var server = smtpSettings["Server"] ?? "smtp.gmail.com";
    var port = int.Parse(smtpSettings["Port"] ?? "587");

    try
    {
        // بناء جسم الإيميل HTML
        var htmlBody = $@"
        <div style='font-family:Arial,sans-serif; padding:20px; background-color:#fff;'>
            <h2>Hi 👋,</h2>
            <p><strong>We received an email confirmation request for your account.</strong><br />
            Please use the below One-Time-Password to verify your email:</p>

            <p style='font-size:20px; font-weight:bold;'>OTP: {otp}</p>

            <p>If you did not request an email confirmation, please ignore this message.</p>

            <p style='margin-top:20px;'>Thanks,<br />
            <span style='color:gray;'>Your friends at ElCapitano 😉</span></p>

            <div style='margin-top:30px;'>
                <p style='font-size:12px; color:#ff0000;'>This is an automated message, please do not reply.</p>
            </div>
        </div>";

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = "🔐 Email Confirmation - OTP Inside",
            Body = htmlBody,
            IsBodyHtml = true
        };
        mailMessage.To.Add(email);

        using var smtpClient = new SmtpClient(server)
        {
            Port = port,
            Credentials = new NetworkCredential(fromEmail, password),
            EnableSsl = true,
        };

        await smtpClient.SendMailAsync(mailMessage);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error sending OTP email to {Email}", email);
        throw;
    }
}


        // خزن OTP في الكاش مع صلاحية 5 دقائق
        public void CacheOtp(string email, string otp)
        {
            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = _otpExpiry
            };

            _cache.Set(GetOtpKey(email), otp, cacheEntryOptions);
        }

        public bool VerifyOtp(string email, string otp)
        {
            if (_cache.TryGetValue(GetOtpKey(email), out string cachedOtp))
            {
                if (cachedOtp == otp)
                {
                    _cache.Remove(GetOtpKey(email)); // امسح الـ OTP بعد التحقق
                    return true;
                }
            }
            return false;
        }

        private string GetOtpKey(string email) => $"otp_{email}";

        // ----------- تخزين بيانات المستخدم المؤقتة -------------

        public void CacheTempUser(string email, TempUser user)
        {
            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = _otpExpiry
            };

            _cache.Set(GetTempUserKey(email), user, cacheEntryOptions);
        }

        public TempUser GetTempUser(string email)
        {
            if (_cache.TryGetValue(GetTempUserKey(email), out TempUser user))
                return user;
            return null;
        }

        public void RemoveTempUser(string email)
        {
            _cache.Remove(GetTempUserKey(email));
        }

        private string GetTempUserKey(string email) => $"tempuser_{email}";

        public class TempUser
        {
            public required string FirstName { get; set; }
            public required string LastName { get; set; }
            public required string Email { get; set; }
            public required string PasswordHash { get; set; }
        }
    }
}
