
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface User {
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string
  }
@Injectable({
  providedIn: 'root'
})

export class UserService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) { }

  // تسجيل مستخدم جديد
  register(userData: {
    firstName: string,
    lastName: string,
    email: string,
    password: string
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/register`, JSON.stringify(userData), { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // تسجيل الدخول
  login(credentials: {
    email: string,
    password: string
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/login`, JSON.stringify(credentials), { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // معالجة الأخطاء
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error.error || 'Something went wrong');
  }
}
