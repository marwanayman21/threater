using System.Net;
using System.Net.Mail;

namespace Theater_booking.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

public async Task SendTicketEmailAsync(string email, string userName, Guid ticketCode)
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
        var htmlBody = $@"
        <div style='font-family:Arial,sans-serif; padding:20px; background-color:#ffffff;'>
            <h2 style='color:#222'>Hi {userName} 👋,</h2>
            <p style='font-size:16px;'>
                Thank you for booking with <strong>ElCapitano Theater</strong>!<br />
                Your ticket has been successfully reserved. Below is your ticket code:
            </p>

            <p style='font-size:24px; font-weight:bold; color:#d32f2f; margin:20px 0;'>🎟️ {ticketCode}</p>

            <p style='font-size:16px;'>
                Please keep this code safe. It will be required for entry and verification.<br />
                You can check the full ticket details in your account or by scanning the QR code at the entrance.
            </p>

            <p style='margin-top:30px;'>Enjoy the show! 🎭</p>

            <p style='margin-top:20px; font-size:14px; color:gray;'>
                — The ElCapitano Team
            </p>

            <div style='margin-top:30px;'>
                <a href='mailto:support@elcapitano.com' 
                   style='display:inline-block; padding:12px 20px; background-color:#d32f2f; 
                          color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;'>
                    Need Help? Contact Support ✉️
                </a>
            </div>
        </div>";

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = "🎟️ Your Theater Ticket - ElCapitano",
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
        _logger.LogError(ex, "Error sending ticket email to {Email}", email);
        throw;
    }
}

    }
}
