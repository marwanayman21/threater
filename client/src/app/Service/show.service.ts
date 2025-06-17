  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable, throwError, catchError} from 'rxjs';

  @Injectable({
    providedIn: 'root'
  })
  export class ShowService {
    private apiUrl = 'http://localhost:5000/api/Show';

    constructor(private http: HttpClient) {}

    getAllShows(): Observable<{ id: number, day: string }[]> {
  return this.http.get<{ id: number, day: string }[]>(this.apiUrl).pipe(
    catchError(error => {
      console.error('Error fetching shows:', error);
      return throwError(() => new Error('Failed to fetch shows.'));
    })
  );
}

  }
