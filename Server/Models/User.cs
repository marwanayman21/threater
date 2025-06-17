using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Theater_booking.Models
{
    public class User
    {
        public int UserId { get; set; }

        [Required]
        [StringLength(50)]
        public required string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public required string LastName { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
