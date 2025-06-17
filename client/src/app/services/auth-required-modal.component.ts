import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-required-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
       *ngIf="show">
    <div class="bg-[hsl(217.5_11.4%_13.7%)] rounded-lg shadow-lg w-80 max-w-full">
      <div class="px-6 py-4 text-gray-300 text-center text-base font-semibold">
      to continue, you need to log in or register.
    </div>
      <div class="flex justify-end space-x-3 px-6 py-3 border-t border-gray-400">
        <button (click)="cancel()" class="rounded-md px-4 py-2 bg-gray-700 text-white hover:bg-gray-600">
          Cancel
        </button>
        <button (click)="continue()" class="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-500">
          Continue
        </button>
      </div>
    </div>
  </div>
  `
})
export class AuthRequiredModalComponent {
  show = false;

  constructor(private modalService: ModalService, private router: Router) {
    this.modalService.authRequiredModal$.subscribe(val => this.show = val);
  }

  cancel() {
    this.modalService.closeAuthRequiredModal();
  }

  continue() {
    this.modalService.closeAuthRequiredModal();
    this.router.navigate(['/login']);
  }
}
