using Microsoft.EntityFrameworkCore;
using Theater_booking.Data;
using Theater_booking.Models;

public class Timeout : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(0.25);

    public Timeout(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(_interval, stoppingToken);

            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var now = DateTime.UtcNow;

            var expired = await context.Reservations
                .Where(r => r.Status == ReservationStatus.Pending && r.BookedAt.AddMinutes(6) <= now)
                .ToListAsync();

            if (expired.Any())
            {
                context.Reservations.RemoveRange(expired);
                await context.SaveChangesAsync();
            }
        }
    }
}
