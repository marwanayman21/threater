export interface Seat {
  id: number;
  booked: boolean;
  row: string;
  number: number;
  position: 'Left' | 'Center' | 'Right';
  price: number;
  section: 'Upper' | 'Ground1' | 'Ground2';
  seatCode: string;
  selected?: boolean;
}
