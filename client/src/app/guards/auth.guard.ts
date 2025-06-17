import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../../app/Service/auth.service';
import { ModalService } from '../services/modal.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.token) {
      return true; // المستخدم مسجل → يسمح بالدخول
    }

    this.modalService.openAuthRequiredModal(); // عرض المودال
    return false; // منع التنقل
  }
}
