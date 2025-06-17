import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as QRCode from 'qrcode';
import { HeaderComponent } from "../shared/header/header.component";

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, HttpClientModule, HeaderComponent],
  templateUrl: './my-tickets.component.html'
})
export class MyTicketsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/Ticket';
  selectedTicket: any = null;


selectTicket(ticket: any) {
  this.selectedTicket = ticket;
}


  tickets: { ticketCode: string; isScanned: boolean; seat: string; day: string; qr: string }[] = [];

  async ngOnInit() {
    const user = localStorage.getItem('currentUser');
    if (!user) return;

    const userId = JSON.parse(user).userId;

this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`)
  .subscribe(async res => {
    const sorted = res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const ticketList = await Promise.all(sorted.map(async ticket => {
      const qr = await QRCode.toDataURL(ticket.ticketCode);
      return {
        ticketCode: ticket.ticketCode,
        isScanned: ticket.isScanned,
        seat: ticket.seat,
        day: ticket.day,
        qr,
        time: ticket.time,
        section: ticket.section,
        row: ticket.row,
        title: ticket.title,
        location: ticket.location
      };
    }));
    this.tickets = ticketList;
  });


  }
}
