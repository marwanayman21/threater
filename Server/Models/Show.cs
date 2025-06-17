using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Theater_booking.Models
{
    public class Show
    {
        [Key]
        public int ShowId { get; set; }

        [Required]
        public string Day { get; set; } = null!;

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}