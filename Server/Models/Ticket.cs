using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Theater_booking.Models
{
public class Ticket
{
    [Key]
    public Guid TicketCode { get; set; }

    public int UserId { get; set; }

    public int? ShowId { get; set; }   // ✅ العرض القديم
    public Show? Show { get; set; }

    public int? Show2Id { get; set; }  // ✅ العرض الجديد
    public Show2? Show2 { get; set; }

    public bool IsScanned { get; set; } = false;

    public string SeatsDescription { get; set; }

    public User User { get; set; }
}

}