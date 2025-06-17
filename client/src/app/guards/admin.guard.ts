import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../app/Service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.currentUserValue;

    if (user?.email === 'Adminkhaled@gmail.com' || user?.email === 'secuirityG220@gmail.com') return true;

    this.router.navigate(['/home']);
    return false;
  }
}
