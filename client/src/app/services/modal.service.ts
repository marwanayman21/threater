import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private showtimesModalSubject = new BehaviorSubject<boolean>(false);
  showtimesModal$ = this.showtimesModalSubject.asObservable();

  private authRequiredModalSubject = new BehaviorSubject<boolean>(false);
  authRequiredModal$ = this.authRequiredModalSubject.asObservable();

  openShowtimesModal() {
    this.showtimesModalSubject.next(true);
  }

  closeShowtimesModal() {
    this.showtimesModalSubject.next(false);
  }

  openAuthRequiredModal() {
    this.authRequiredModalSubject.next(true);
  }

  closeAuthRequiredModal() {
    this.authRequiredModalSubject.next(false);
  }
}
