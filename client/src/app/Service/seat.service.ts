import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeatsService {
  private apiUrl = 'http://localhost:5000/api/Seats';

  constructor(private http: HttpClient) { }

  getStructuredSeats(showId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/structured?showId=${showId}`).pipe(
      catchError(this.handleError)
    );
  }

confirmBooking(userId: number, showId: number, seatIds: number[]): Observable<{
  success: boolean;
  message: string;
  reservationId: number; // تأكد من وجود هذا النوع
}> {
  return this.http.post<{
    success: boolean;
    message: string;
    reservationId: number;
  }>(`${this.apiUrl}/book`, {
    userId,
    showId,
    seatIds
  }).pipe(
    catchError(this.handleError)
  );
}


  getReservationDetails(reservationId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservation/${reservationId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong'));
  }

  getShows(): Observable<any> {
    return this.http.get('http://localhost:5000/api/Show').pipe(
      catchError(this.handleError)
    );
  }
}
