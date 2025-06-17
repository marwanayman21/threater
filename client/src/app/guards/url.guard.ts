// url.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, NavigationStart } from '@angular/router';
import { AuthService } from '../Service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UrlGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const nav = this.router.getCurrentNavigation();
    const user = this.authService.currentUserValue;

    // لو أدمن → مسموح بكل حاجة
    if (user?.email === 'Adminkhaled@gmail.com') return true;

    // لو مش أدمن و التنقل مش من زرار (يعني كتب URL بإيده)
    if (!nav) {
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
