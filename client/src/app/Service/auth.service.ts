import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/Auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  register(data: { firstName: string; lastName: string; email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/register`, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  resendOtp(email: string) {
    return this.http.post(
      `${this.apiUrl}/resend`,
      { email: email },
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }

  login(credentials: { Email: string; Password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials: true
    }).pipe(
      map(response => {
        const user = {
          ...response.user,
          token: response.token
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userToken', response.token);
        this.currentUserSubject.next(user);
        return response;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post<any>(`${this.apiUrl}/verify`, { email, otp }).pipe(
      map(response => response),
      catchError(error => {
        console.error('OTP verification error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  verifyResetOtp(email: string, otp: string) {
    return this.http.post<any>(`${this.apiUrl}/verify-reset`, { email, otp }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Reset OTP verification error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }
resetPassword(email: string, otp: string, newPassword: string) {
  return this.http.post(`${this.apiUrl}/reset-password`, { email, otp, newPassword });
}

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleError(error: any): Error {
    if (error.error instanceof ErrorEvent) {
      console.error('Client error:', error.error.message);
      return new Error('Network error occurred');
    } else {
      console.error(`Server error: ${error.status} - ${error.message}`);
      return new Error(error.error?.message || 'Server error occurred');
    }
  }
}
