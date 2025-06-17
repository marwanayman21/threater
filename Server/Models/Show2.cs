using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Theater_booking.Models
{
    public class Show2
    {
        [Key]
        public int Show2Id { get; set; }

        [Required]
        public string Day { get; set; } = null!;

        [Required]
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}