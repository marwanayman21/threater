import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeatsService } from '../Service/seat.service';
import { AdminService } from '../Service/admin.service';
import { CanComponentDeactivate } from '../guards/unsaved-changes.guard';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  reservationId: number = 0;
  selectedShow: string = '';
  selectedSeats: any[] = [];
showSuccessMessage = false;

  // ⏱️ Countdown timer
  remainingSeconds: number = 0;
  displayTime: string = '00:00';
  private intervalId: any;

  // 🔄 Status-polling interval
  private statusPollingId: any;

  // 🖥️ UI state
  isLoading: boolean = true;
  errorMessage: string = '';
  showExpired: boolean = false;
  cancelledByUser: boolean = false;
  Approved: boolean = false;
  showConfirmModal = false;

  // رسائل المودال
  expiredTitle: string = 'انتهى الوقت';
  expiredMessage: string = 'انتهت مهلة الدفع. تم إلغاء الحجز تلقائياً.';
  redirectCountdown: number = 5;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seatsService: SeatsService,
    private AdminService: AdminService
  ) {}

  // ============ NAV GUARD ============ //
canDeactivate(): Observable<boolean> | boolean {
  // ✅ لو Approved أو انتهى الوقت أو المستخدم لغى → سيبه يخرج فورًا
  if (this.remainingSeconds <= 0 || this.cancelledByUser || this.Approved) {
    return true;
  }

  // ✅ لو الحالة Rejected من السيرفر → برضو سيبه يخرج
  return new Observable<boolean>((observer) => {
    this.seatsService.getReservationDetails(this.reservationId).subscribe({
      next: (status) => {
        if (status === 'Rejected') {
          observer.next(true);
          observer.complete();
          return;
        }

        // ✅ باقي الحالات → اسأله إذا حابب يخرج
        const confirmLeave = confirm(
          'هل أنت متأكد أنك تريد مغادرة الصفحة؟ سيتم إلغاء الحجز.'
        );

        if (!confirmLeave) {
          observer.next(false);
          observer.complete();
          return;
        }

        // ❌ مفيش داعي توافقه هنا، خلي ده يحصل من مكان تاني لو لزم
        this.AdminService.updateReservationStatus(this.reservationId, 'Rejected').subscribe({
          next: () => {
            this.cancelledByUser = true;
            observer.next(true);
            observer.complete();
          },
          error: () => {
            this.errorMessage = 'فشل في إلغاء الحجز. يرجى المحاولة لاحقاً.';
            observer.next(false);
            observer.complete();
          },
        });
      },
      error: () => {
        this.errorMessage = 'حدث خطأ أثناء التحقق من حالة الحجز.';
        observer.next(false);
        observer.complete();
      },
    });
  });
}



  // ============ LIFECYCLE ============ //
  ngOnInit(): void {
      // منع الرجوع للوراء من my-tickets
  if (sessionStorage.getItem('cameFromPayment') === 'true') {
    // نظف الحالة لأنه مش لازم تبقى دايماً
    sessionStorage.removeItem('cameFromPayment');
    this.router.navigate(['/']);
    return; // اوقف التنفيذ
  }
    window.onbeforeunload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    this.route.queryParams.subscribe((params) => {
      this.reservationId = +params['reservationId'];
      this.selectedShow = params['show'] || 'العرض غير معروف';

      if (this.reservationId && !isNaN(this.reservationId)) {
        this.loadReservationDetails(this.reservationId);
      } else {
        this.errorMessage = 'رقم الحجز غير صحيح أو مفقود';
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.statusPollingId);
    window.onbeforeunload = null;
  }

  // ============ DATA LOADING ============ //
  private loadReservationDetails(reservationId: number): void {
    this.seatsService.getReservationDetails(reservationId).subscribe({
      next: (reservation: any) => {
        const bookedAt = new Date(reservation.bookedAt);
        const now = new Date();

        const totalSeconds = 11160; // 6 دقائق
        const secondsPassed = Math.floor(
          (now.getTime() - bookedAt.getTime()) / 1000
        );
        this.remainingSeconds = totalSeconds - secondsPassed;

        if (this.remainingSeconds <= 0) {
          this.remainingSeconds = 0;
          this.showExpiredModal();
          return;
        }

        this.updateDisplayTime();
        this.startTimer();
        this.startStatusPolling(); // 🔄 يبدأ متابعة الحالة

        this.selectedSeats = reservation.seats.map((seat: any) => ({
          id: seat.id,
          row: seat.seatCode.substring(0, 1),
          number: seat.seatCode.substring(1),
          position: 'Center',
          price: seat.price,
          section: this.getSectionFromSeatCode(seat.seatCode),
          booked: false,
          seatCode: seat.seatCode,
          selected: true,
        }));

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          'فشل في تحميل تفاصيل الحجز. يرجى المحاولة لاحقاً.';
        this.isLoading = false;
      },
    });
  }

  // ============ STATUS POLLING ============ //
  private startStatusPolling(): void {
    this.statusPollingId = setInterval(() => {
      this.seatsService.getReservationDetails(this.reservationId).subscribe({
        next: (res: any) => {
          switch (res.status) {
          case 'Approved':
          clearInterval(this.statusPollingId);
          this.Approved = true;

          // عرض الرسالة + عد تنازلي 5 ثواني
          this.showSuccessMessage = true;  // خاصية جديدة
          let countdown = 5;
          const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
              clearInterval(countdownInterval);
              this.router.navigate(['/tickets'], { replaceUrl: true });
            }
          }, 1000);

          break;


          }
        },
        error: () => {
          // خطأ في جلب الحالة → نستمر في المحاولة
        },
      });
    }, 3000); // كل 3 ثواني
  }

  // ============ TIMER ============ //
  private startTimer(): void {
    this.intervalId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateDisplayTime();
      } else {
        clearInterval(this.intervalId);
        this.showExpiredModal();
      }
    }, 1000);
  }

  private updateDisplayTime(): void {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    this.displayTime = `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  // ============ MODALS & ACTIONS ============ //
  openConfirmModal(): void {
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }

  cancelOrder(): void {
    this.showConfirmModal = false;
    if (this.reservationId) {
      this.isLoading = true;
      this.AdminService.updateReservationStatus(
        this.reservationId,
        'Rejected'
      ).subscribe({
        next: () => {
          this.cancelledByUser = true;
          this.isLoading = false;
          this.showExpiredModal();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'فشل في إلغاء الحجز. يرجى المحاولة لاحقاً.';
        },
      });
    }
  }

  private showExpiredModal(): void {
    this.showExpired = true;
    if (this.cancelledByUser) {
      this.expiredTitle = 'تم إلغاء الحجز';
      this.expiredMessage =
        'لقد تم إلغاء حجزك بنجاح. نتمنى أن تعيد الحجز معنا مرة أخرى.';
    } else {
      this.expiredTitle = 'انتهى الوقت';
      this.expiredMessage = 'انتهت مهلة الدفع. تم إلغاء الحجز تلقائياً.';
    }

    const countdownInterval = setInterval(() => {
      if (this.redirectCountdown > 0) {
        this.redirectCountdown--;
      } else {
        clearInterval(countdownInterval);
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  // ============ SEAT HELPERS ============ //
  private getSectionFromSeatCode(seatCode: string): string {
    const row = seatCode.substring(0, 1);
    if (
      [ 'U', 'V', 'W', 'X', 'Y', 'Z'].includes(row)
    ) {
      return 'Upper';
    } else if (['Q', 'R', 'S', 'T'].includes(row)) {
      return 'Ground1';
    } else {
      return 'Ground2';
    }
  }

  getGroupedSeats() {
    const groups = new Map<
      string,
      { label: string; color: string; seats: string[]; price: number }
    >();

    this.selectedSeats.forEach((seat) => {
      const label = this.getSeatLabel(seat.section);
      const color = this.getSeatColor(seat.section);
      const key = seat.section;

      if (!groups.has(key)) {
        groups.set(key, {
          label,
          color,
          seats: [seat.seatCode],
          price: seat.price,
        });
      } else {
        const group = groups.get(key)!;
        group.seats.push(seat.seatCode);
      }
    });

    return Array.from(groups.values());
  }

  private getSeatLabel(section: string): string {
    switch (section) {
      case 'Ground2':
        return 'Platinum';
      case 'Ground1':
        return 'Gold';
      case 'Upper':
        return 'Silver';
      default:
        return section;
    }
  }

  private getSeatColor(section: string): string {
    switch (section) {
      case 'Ground2':
        return 'bg-[#999999] text-white';
      case 'Ground1':
        return 'bg-[#d4Af37] text-black';
      case 'Upper':
        return 'bg-[#6c6c6c] text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  calculateTotal(): number {
    return this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }

  // ============ UTILS ============ //
  encodeURIComponent(value: string): string {
    return encodeURIComponent(value);
  }
}
