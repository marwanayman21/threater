using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Theater_booking.Models
{
    public class NewSeat
    {
        public int Id { get; set; }

        [Required]
        public string Row { get; set; } = null!;

        [Required]
        public int Number { get; set; }

        [Required]
        public string Position { get; set; } = null!;

        [Required]
        public int Price { get; set; }

        [Required]
        public string Section { get; set; } = null!;

        [NotMapped]
        public string SeatCode => $"{Row}{Number}";

        public ICollection<NewSeatReservation> SeatReservations { get; set; } = new List<NewSeatReservation>();
    }
}
