import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../Service/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  registerForm: FormGroup;
  loginForm: FormGroup;
  isLoginActive = true;
  isAnimating = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword = false;
  showConfirmPassword = false;
  showLoginPassword = false;
resetForms() {
  // Reset forms and clear inputs
  this.loginForm.reset();
  this.registerForm.reset();

  // Reset error states
  this.errorMessage = '';
  this.isLoading = false;

  // Reset password visibility
  this.showPassword = false;
  this.showConfirmPassword = false;
  this.showLoginPassword = false;
}

// تعديل دالتي showLogin و showRegister
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, this.validateName.bind(this)]],
      lastName: ['', [Validators.required, this.validateName.bind(this)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.validatePassword.bind(this)]],
      confirmPassword: ['', [Validators.required]]
    }, {validator: this.passwordMatchValidator.bind(this)});
  }

  validateName(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (/[0-9]/.test(value)) {
      return { invalidName: true };
    }
    return null;
  }

  validatePassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const errors: any = {};

    if (!value) return null;

    if (!/[A-Z]/.test(value)) errors.missingUpperCase = true;
    if (!/[a-z]/.test(value)) errors.missingLowerCase = true;
    if (!/[0-9]/.test(value)) errors.missingNumber = true;
    if (!/[^A-Za-z0-9]/.test(value)) errors.missingSymbol = true;
    if (value.length < 8) errors.minLength = true;

    return Object.keys(errors).length ? errors : null;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  resetFormErrors() {
    this.errorMessage = '';
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.setErrors(null);
      this.loginForm.get(key)?.markAsUntouched();
    });
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.setErrors(null);
      this.registerForm.get(key)?.markAsUntouched();
    });
  }


showLogin() {
  this.isAnimating = true;
  this.isLoginActive = true;
  this.resetForms();
}

showRegister() {
  this.isAnimating = true;
  this.isLoginActive = false;
  this.resetForms();
}
showForgotPassword() {
  this.router.navigate(['/forgot-password']);
}
  onAnimationEnd() {
    this.isAnimating = false;
  }

  onLogin() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/verify-otp'], {
          queryParams: { email: this.registerForm.value.email }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0)
      return 'Unable to connect to server. Please check your connection.';
    else if (error.status === 500)
      return 'Server error. Please try again later.';
    else if (error.status === 400)
      return 'User already exists.';
    else if (error.message==='Invalid credentials')
      return 'Invalid email or password.';
    else
      return 'An error occurred. Please try again later.';
  }
}
