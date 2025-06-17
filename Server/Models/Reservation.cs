using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Theater_booking.Models
{
    public class Reservation
    {
        [Key]
        public int ReservationId { get; set; }

        public int UserId { get; set; }

public int? ShowId { get; set; }
public Show? Show { get; set; }

public int? Show2Id { get; set; }
public Show2? Show2 { get; set; }


        public ICollection<SeatReservation> SeatReservations { get; set; } = new List<SeatReservation>();
        public ICollection<NewSeatReservation> NewSeatReservations { get; set; } = new List<NewSeatReservation>(); // علاقته بكراسي المسرح التاني

        public DateTime BookedAt { get; set; } = DateTime.UtcNow;
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

        public User User { get; set; } = null!;

    }

    public enum ReservationStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }
}
