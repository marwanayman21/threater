namespace Theater_booking.Models
{
    public class NewSeatReservation
    {
        public int Id { get; set; }

        public int SeatId { get; set; }
        public NewSeat Seat { get; set; } = null!;

        public int ReservationId { get; set; }
        public Reservation Reservation { get; set; } = null!;
    }
}
