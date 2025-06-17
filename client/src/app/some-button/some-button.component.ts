import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-some-button',
  imports: [CommonModule],
  template: `
    <button
  (click)="openModal()"
  class="bg-yellow-500 text-black px-6 py-2 rounded font-bold">
  احجز الان
</button>

  `,
})
export class SomeButtonComponent {
  constructor(private modalService: ModalService) {}

  openModal() {
    this.modalService.openShowtimesModal();
  }
  canGetTickets(): boolean {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 9 && hours <24; // من 9 صباحاً لحد 11:59 مساءً
}

}
