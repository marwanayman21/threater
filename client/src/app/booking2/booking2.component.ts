import { Component, ElementRef, ViewChild, AfterViewInit, Pipe, PipeTransform, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderDetailsComponent } from '../shared/header-details/header-details.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Seat } from '../models/seat.model';
import { SeatsService } from '../Service/seat2.service';
import { BehaviorSubject  } from 'rxjs';

@Pipe({
  name: 'filterPosition',
  standalone: true
})
export class FilterPositionPipe implements PipeTransform {
  transform(seats: Seat[], position: 'Left' | 'Center' | 'Right'): Seat[] {
    return seats.filter(seat => seat.position === position);
  }
}

@Component({
  selector: 'app-booking2',
  standalone: true,
  imports: [CommonModule, HeaderDetailsComponent, RouterModule, FilterPositionPipe],
  templateUrl: './booking2.component.html',
})
export class BookingComponent implements AfterViewInit, OnInit  {
  @ViewChild('zoomContainer') zoomContainer!: ElementRef;
  @Input() seats: Seat[] = [];
  @Input() selectedShow: string = '';
  selectedSeats: Seat[] = [];
  selectedSeats$ = new BehaviorSubject<Seat[]>([]);
  @Output() seatsUpdated = new EventEmitter<Seat[]>();
// في بداية الكلاس
private initialTouchDistance: number | null = null;
private initialScale: number = 1;

  showConfirmModal = false;
  showErrorMessage = false;
  isLoading = false;
  errorMessage = '';

  scale = 0.7;
  posX = 0;
  posY = 0;
  isDragging = false;
  startX = 0;
  startY = 0;
  transformStyle = 'translate(0px, 0px) scale(0.7)';

  groundSection2Rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H','I', 'J', 'K', 'L', 'M', 'N', 'O'].reverse();
  groundSection1Rows = ['Q', 'R', 'S', 'T'].reverse();
  upperRows = [ 'U', 'V', 'W', 'X', 'Y', 'Z'].reverse();

  seatTypes = [
    { label: 'Silver', section: 'Upper', price: 350, color: '#6c6c6c' },
    { label: 'Gold', section: 'Ground1', price: 500, color: '#d4Af37' },
    { label: 'Platinum', section: 'Ground2', price: 650, color: '#999999' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seatsService: SeatsService
  ) {}

ngOnInit() {
if (window.innerWidth < 768) {
    this.scale = 1; // حجم ثابت للموبايل
    this.posY = 0; // إزالة الإزاحة الرأسية
  } else {
    this.scale = 0.7;
    this.posY = -50;
  }
  this.updateTransform();

  this.route.queryParams.subscribe(params => {
    const showId = params['showId'];
    this.selectedShow = params['show'] || '';
    if (showId) {
      this.loadSeats(+showId);
    }
  });
  this.route.queryParams.subscribe(params => {
    const showId = params['showId'];
    this.selectedShow = params['show'] || '';
    if (showId) {
      this.loadSeats(+showId);  // مرر showId للـ API
    }
  });
}


private loadSeats(showId: number): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.seatsService.getStructuredSeats(showId).subscribe({
    next: (data) => {
      const allSeats: Seat[] = [];

      ['Upper', 'Ground1', 'Ground2'].forEach(section => {
        if (data[section]) {
          for (const row in data[section]) {
            data[section][row].forEach((seat: any) => {
              allSeats.push({
                id: seat.id,
                row: seat.row,
                number: seat.number,
                position: seat.position,
                price: seat.price,
                section: section as 'Upper' | 'Ground1' | 'Ground2',
                booked: seat.isBooked,  // <-- مهم
                seatCode: seat.seatCode,
                selected: false
              });
            });
          }
        }
      });

      this.seats = allSeats;
      this.isLoading = false;
    },
    error: (err) => {
      this.errorMessage = 'Failed to load seats. Please try again later.';
      this.isLoading = false;
      console.error('Error loading seats:', err);
    }
  });
}



  ngAfterViewInit() {
    this.centerView();
  }

  centerView() {
    this.posY = -50;
    this.updateTransform();
  }
handleTouchMove(event: TouchEvent) {
  if (event.touches.length === 2) {
    event.preventDefault();
    this.handlePinchZoom(event);
  } else if (this.isDragging && event.touches.length === 1) {
    this.onDrag(event);
  }
}

// دالة للتعامل مع التكبير/التصغير باللمس المتعدد
private handlePinchZoom(event: TouchEvent) {
  const touch1 = event.touches[0];
  const touch2 = event.touches[1];

  const currentDistance = Math.hypot(
    touch2.clientX - touch1.clientX,
    touch2.clientY - touch1.clientY
  );

  if (this.initialTouchDistance === null) {
    this.initialTouchDistance = currentDistance;
    this.initialScale = this.scale;
    return;
  }

  const scaleFactor = currentDistance / this.initialTouchDistance;
  this.scale = Math.min(Math.max(0.8, this.initialScale * scaleFactor), 1.5);
  this.updateTransform();
}
  startDrag(event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.cursor-pointer')) return;

    if ('button' in event && event.button !== 0) return;
    this.isDragging = true;

    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;

    this.startX = clientX - this.posX;
    this.startY = clientY - this.posY;
  }

  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;

    this.posX = clientX - this.startX;
    this.posY = clientY - this.startY;

    this.updateTransform();
  }

endDrag() {
  this.isDragging = false;
  this.initialTouchDistance = null;
}

  onZoom(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.05 : -0.05;
    this.scale = Math.min(Math.max(0.5, this.scale + delta), 1.5);
    this.updateTransform();
  }

  updateTransform() {
    this.transformStyle = `translate(${this.posX}px, ${this.posY}px) scale(${this.scale})`;
  }

  getSeatsBySection(section: 'Upper' | 'Ground1' | 'Ground2'): Seat[] {
    return this.seats.filter(seat => seat.section === section);
  }

  // ** هذه الدالة تم إضافتها لتصفية المقاعد حسب الصف **
  getSeatsByRow(seats: Seat[], row: string): Seat[] {
    return seats.filter(seat => seat.row === row);
  }

toggleSeat(seat: Seat): void {
  if (this.isDragging || seat.booked) return;

  seat.selected = !seat.selected;

  // تحديث مصدر الحقيقة الأساسي
  let updatedSeats = [...this.selectedSeats$.value];
  if (seat.selected) {
    // منع التكرار
    if (!updatedSeats.some(s => s.id === seat.id)) {
      updatedSeats.push(seat);
    }
  } else {
    updatedSeats = updatedSeats.filter(s => s.id !== seat.id);
  }

  this.selectedSeats$.next(updatedSeats);
  this.selectedSeats = updatedSeats;
  this.seatsUpdated.emit(updatedSeats);
}


removeSeat(seat: Seat): void {
  // حدد الكرسي الأصلي من seats وعدّل حالته
  const target = this.seats.find(s => s.id === seat.id);
  if (target) target.selected = false;

  const updated = this.selectedSeats.filter(s => s.id !== seat.id);
  this.selectedSeats = updated;
  this.selectedSeats$.next(updated);
  this.seatsUpdated.emit(updated);
}


  getColorBySection(section: string): string {
    const found = this.seatTypes.find(type => type.section === section);
    return found ? found.color : '#ccc';
  }

clearAllSelectedSeats(): void {
  // حدث كل الكراسي في الواجهة كـ selected = false
  this.selectedSeats.forEach(seat => {
    const original = this.seats.find(s => s.id === seat.id);
    if (original) original.selected = false;
  });

  this.selectedSeats = [];
  this.selectedSeats$.next([]);
  this.seatsUpdated.emit([]);
}


  groupedSelectedSeats() {
    // تجميع المقاعد المحددة حسب القسم
    const map = new Map<string, { label: string, section: string, count: number, price: number, color: string }>();

    this.selectedSeats.forEach(seat => {
      const key = seat.section;
      if (!map.has(key)) {
        const type = this.seatTypes.find(t => t.section === seat.section);
        if (type) {
          map.set(key, {
            label: type.label,
            section: seat.section,
            count: 1,
            price: type.price,
            color: type.color
          });
        }
      } else {
        map.get(key)!.count++;
      }
    });

    return Array.from(map.values());
  }

  openConfirmModal() {
    if (this.selectedSeats.length === 0) {
      this.showErrorMessage = true;
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
      return;
    }
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

proceedToPayment() {
  this.showConfirmModal = false;
  const seatIds = this.selectedSeats.map(s => s.id);
  const currentUserStr = localStorage.getItem('currentUser');
  let userId: number | null = null;

  if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr);
    userId = currentUser.userId;
  }

  const showId = Number(this.route.snapshot.queryParamMap.get('showId'));

  if (!userId || !showId || seatIds.length === 0) {
    this.errorMessage = 'بيانات الحجز ناقصة';
    return;
  }

 this.seatsService.confirmBooking(userId, showId, seatIds).subscribe({
    next: (response) => {
      if (response.success && response.reservationId) {
        this.router.navigate(['/payment'], {
          queryParams: {
            reservationId: response.reservationId,
            show: this.selectedShow
          }
        });
      } else {
        alert(response.message || 'تم الحجز ولكن لم يتم إرجاع رقم الحجز');
      }
    },
    error: (err) => {
      console.error('Booking error:', err);
      alert('حدث خطأ أثناء الحجز: ' + err.error?.message || err.message);
    }
  });
}



  calculateTotal(): number {
    return this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }


}
