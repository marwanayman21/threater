using Microsoft.EntityFrameworkCore;
using Theater_booking.Models; // غيّر حسب مكان الموديل بتاعك

namespace Theater_booking.Data
{
    public class AppDbContext : DbContext
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Reservation>()
                .Property(r => r.BookedAt)
                .HasColumnType("datetime");

            // علاقة 1-متعدد بين Reservation و NewSeatReservation
            modelBuilder.Entity<NewSeatReservation>()
                .HasOne(nsr => nsr.Reservation)
                .WithMany(r => r.NewSeatReservations)
                .HasForeignKey(nsr => nsr.ReservationId);

            modelBuilder.Entity<NewSeatReservation>()
                .HasOne(nsr => nsr.Seat)
                .WithMany(s => s.SeatReservations)
                .HasForeignKey(nsr => nsr.SeatId);

            base.OnModelCreating(modelBuilder);
        }

        public AppDbContext(DbContextOptions<AppDbContext> options): base (options) { }
        
        public DbSet<Show> Shows { get; set; }
        public DbSet<Show2> Shows2 { get; set; }
        public DbSet<Seat> Seats { get; set; }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<NewSeat> NewSeats { get; set; }
        public DbSet<NewSeatReservation> NewSeatReservations { get; set; }

        public DbSet<SeatReservation> SeatReservations { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        // تقدر تضيف جداول تانية هنا بنفس الشكل
        // public DbSet<AnotherModel> AnotherTable { get; set; }
    }
}
