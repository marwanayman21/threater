import { PlayDetailsPageComponent2 } from './play-details-page2/play-details-page2.component';
import { UrlGuard } from './guards/url.guard';
import { AdminGuard } from './guards/admin.guard';
import { VerifyOtpComponent } from './verify-otp/verify-otp.component';
import { MyTicketsComponent } from './my-tickets/my-tickets.component';
import { PaymentComponent } from './payment/payment.component';
import { BookingComponent } from './booking/booking.component';
import { PlayDetailsPageComponent } from './play-details-page/play-details-page.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { Routes } from '@angular/router';
import { TicketVerificationComponent } from './ticket-verification/ticket-verification.component';
import { AuthGuard } from './guards/auth.guard';
import { CustomerServiceComponent } from './admin/customer-service/customer-service.component';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // مفتوحة للكل (حتى غير المسجل)
  { path: 'home', component: HomeComponent, canActivate: [UrlGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // كل الصفحات الباقية ممنوع تدخلها بالـ URL لو مش أدمن
  { path: 'play-details', component: PlayDetailsPageComponent, canActivate: [AdminGuard] },
  { path: 'play-details2', component: PlayDetailsPageComponent2, canActivate: [UrlGuard] },

  { path: 'booking', component: BookingComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard], canDeactivate: [UnsavedChangesGuard]},
  { path: 'tickets', component: MyTicketsComponent, canActivate: [AuthGuard] },
  { path: 'verify-otp', component: VerifyOtpComponent },

  // صفحة الأدمن: مسموحة فقط لو هو أدمن
  { path: 'admin', component: CustomerServiceComponent, canActivate: [AdminGuard] },
  { path: 'ticket-verification', component: TicketVerificationComponent, canActivate: [AdminGuard] },
];
