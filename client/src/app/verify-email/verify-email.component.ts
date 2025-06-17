import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../Service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent {
  verifyForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  userId: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userId = parseInt(this.route.snapshot.paramMap.get('userId') || '0');
  }

  onSubmit() {
    if (this.verifyForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyEmail(
      this.userId,
      this.verifyForm.value.otp!
    ).subscribe({
      next: () => {
        this.router.navigate(['/login'], { 
          queryParams: { verified: true } 
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'فشل التحقق، حاول مرة أخرى';
      }
    });
  }
}