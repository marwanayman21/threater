import { Component } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-verification',
  standalone: true,
  imports: [ZXingScannerModule, HttpClientModule, CommonModule,FormsModule],
  templateUrl: './ticket-verification.component.html',
  styleUrls: ['./ticket-verification.component.css']
})
export class TicketVerificationComponent {
  mode: 'scan' | 'manual' = 'scan';

  scannedTicketId: string | null = null;
  message: string | null = null;
  success = false;
  loading = false;

  currentDevice: MediaDeviceInfo | undefined = undefined; // use undefined instead of null
  allowedFormats = [BarcodeFormat.QR_CODE];

  constructor(private http: HttpClient) {}
handleScanSuccess(resultString: string) {
  this.scannedTicketId = resultString;
  this.message = null;
  this.success = false;


}


ticketDetails: any = null;

verifyTicket() {
  if (!this.scannedTicketId) return;

  this.loading = true;

  this.http.post(`http://localhost:5000/api/Ticket/scan/${this.scannedTicketId}`, null)
    .subscribe({
      next: (res) => {
        this.ticketDetails = res;
        this.success = true;
        this.message = null;
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error || 'Error verifying ticket';
        this.ticketDetails = null;
        this.success = false;
        this.loading = false;
      }
    });
}



}
