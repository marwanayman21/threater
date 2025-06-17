import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../Service/admin.service';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component'; // مسار السيرفيس حسب مشروعك

@Component({
  selector: 'app-customer-service',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent],
  templateUrl: './customer-service.component.html',
  styleUrl: './customer-service.component.css'
})
export class CustomerServiceComponent implements OnInit {

  Requests: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadRequests();
    setInterval(() => this.loadRequests(), 5000); // تحديث تلقائي كل 5 ثواني
  }

  loadRequests() {
    this.adminService.getPendingReservations().subscribe(data => {
      this.Requests = data;
    });
  }

  confirm(id: number) {
    this.adminService.updateReservationStatus(id, 'Approved').subscribe(() => {
      this.Requests = this.Requests.filter(r => r.id !== id);
    });
  }

  cancel(id: number) {
    this.adminService.updateReservationStatus(id, 'Rejected').subscribe(() => {
      this.Requests = this.Requests.filter(r => r.id !== id);
    });
  }
}
