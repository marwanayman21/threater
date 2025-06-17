import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../Service/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnDestroy, OnInit {
  // Forms
  forgotForm: FormGroup;
  otpForm: FormGroup;
  resetForm: FormGroup;

  // State variables
  showNewPassword = false;
  showConfirmPassword = false;
  currentStep: number = 1;
  isLoading: boolean = false;
  isPasswordReset: boolean = false;
  errorMessage: string = '';
  email: string = '';
  countdown: number = 5;
  private countdownInterval: any;

  isResendDisabled: boolean = true;
  resendCountdown: number = 30;
  private resendInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router
  ) {
    // Initialize forms
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.matchPasswordsValidator() });
  }

  ngOnInit() {
    this.startResendCountdown();
  }

  // Step 1: Submit email
  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.email = this.forgotForm.value.email;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 2;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'حدث خطأ غير متوقع';
      }
    });
  }

  // Step 2: Verify OTP
  verifyOtp() {
    if (this.otpForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyResetOtp(this.email, this.otpForm.value.otp).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 3;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'رمز غير صالح أو منتهي الصلاحية';
      }
    });
  }

  // Step 3: Reset password
  resetPassword() {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const { newPassword } = this.resetForm.value;

    this.authService.resetPassword(this.email, this.otpForm.value.otp, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.isPasswordReset = true;
        this.startCountdown();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور';
      }
    });
  }

  // Resend OTP
  resendOtp() {
    if (!this.email || !this.email.includes('@') || this.isResendDisabled) return;

    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        alert('تم إرسال OTP مرة أخرى');
        this.startResendCountdown();
      },
      error: () => alert('حدث خطأ أثناء إعادة الإرسال'),
    });
  }

  startResendCountdown() {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }

    this.isResendDisabled = true;
    this.resendCountdown = 30;

    this.resendInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.resendInterval);
        this.resendInterval = null;
        this.isResendDisabled = false;
      }
    }, 1000);
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  // Validators
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const errors: any = {};
      if (!/[A-Z]/.test(value)) errors.missingUpperCase = true;
      if (!/[a-z]/.test(value)) errors.missingLowerCase = true;
      if (!/[0-9]/.test(value)) errors.missingNumber = true;
      if (!/[^A-Za-z0-9]/.test(value)) errors.missingSymbol = true;
      if (value.length < 8) errors.minLength = true;

      return Object.keys(errors).length ? errors : null;
    };
  }

  matchPasswordsValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('newPassword')?.value;
      const confirm = group.get('confirmPassword')?.value;
      return password === confirm ? null : { mismatch: true };
    };
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  }
}
