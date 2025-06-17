using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Theater_booking.Models
{
    public class Seat
    {
        public int Id { get; set; }

        [Required]
        public string Row { get; set; } = null!; // "A", "B", etc.

        [Required]
        public int Number { get; set; }

        [Required]
        public string Position { get; set; } = null!; // "Left", "Center", "Right"

        [Required]
        public int Price { get; set; }

        [Required]
        public string Section { get; set; } = null!; // "Upper", "Ground1", "Ground2"

        [NotMapped]
        public string SeatCode => $"{Row}{Number}";

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
