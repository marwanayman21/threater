import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  getPendingReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservations/pending`);
  }

  updateReservationStatus(reservationId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservation/${reservationId}/status?status=${status}`, {});
  }
}
