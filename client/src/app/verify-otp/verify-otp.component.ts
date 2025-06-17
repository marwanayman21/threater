import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../Service/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnDestroy, OnInit {
  otpForm: FormGroup;
  email: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    public router: Router
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]]
    });

    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

onSubmit() {
  if (this.otpForm.invalid) {
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  const otp = this.otpForm.get('otp')?.value;

  this.authService.verifyOtp(this.email, otp).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.isVerified = true;
      this.startCountdown();
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = this.getErrorMessage(err);
    }
  });
}
// أضف هذه الخصائص للكلاس
isVerified: boolean = false;
countdown: number = 5;
private countdownInterval: any;

isResendDisabled: boolean = true;
resendCountdown: number = 30;
private resendInterval: any;



// أضف هذه الدوال الجديدة
startCountdown() {
  this.countdownInterval = setInterval(() => {
    this.countdown--;
    if (this.countdown === 0) {
      clearInterval(this.countdownInterval);
      this.router.navigate(['/login'], {
        queryParams: { verified: true, email: this.email }
      });
    }
  }, 1000);
}
ngOnInit() {
this.startResendCountdown();
}
ngOnDestroy() {
  if (this.countdownInterval) {
    clearInterval(this.countdownInterval);
  }

  if (this.resendInterval) {
    clearInterval(this.resendInterval);
  }
}

resendOtp() {
  if (!this.email || !this.email.includes('@') || this.isResendDisabled) {
    return;
  }

  this.authService.resendOtp(this.email).subscribe({
    next: () => {
      alert('تم إرسال OTP مرة أخرى');
      this.startResendCountdown(); // يبدأ العد من تاني بعد الإرسال
    },
    error: () => alert('حدث خطأ أثناء إعادة الإرسال'),
  });
}


startResendCountdown() {
  // تأكد إن مفيش عداد شغال بالفعل
  if (this.resendInterval) {
    clearInterval(this.resendInterval);
  }

  this.isResendDisabled = true;
  this.resendCountdown = 30;

  this.resendInterval = setInterval(() => {
    this.resendCountdown--;

    if (this.resendCountdown <= 0) {
      clearInterval(this.resendInterval);
      this.resendInterval = null; // امسح المرجع بعد التوقف
      this.isResendDisabled = false;
    }
  }, 1000);
}




  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }
}
