using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Theater_booking.Models
{
    public class SeatReservation
    {
        [Key]
        public int Id { get; set; }

        public int ReservationId { get; set; }
        public Reservation Reservation { get; set; } = null!;

        public int SeatId { get; set; }
        public Seat Seat { get; set; } = null!;
    }
}
