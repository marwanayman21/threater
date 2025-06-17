import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClientModule } from '@angular/common/http';
import { ShowService } from '../Service/show.service'; // ✅ استدعاء السيرفز

@Component({
  selector: 'app-showtimes-modal',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './showtimes-modal.component.html',
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ transform: 'scale(0.8)', opacity: 0 })),
      ]),
    ]),
  ]
})
export class ShowtimesModalComponent implements OnInit {
  isVisible$!: Observable<boolean>;
  shows: any[] = [];

  constructor(
    private modalService: ModalService,
    private router: Router,
    private showService: ShowService // ✅ Inject السيرفز
  ) { }

  ngOnInit(): void {
    this.isVisible$ = this.modalService.showtimesModal$;

    this.showService.getAllShows().subscribe({
      next: (Day) => this.shows = Day,
      error: (err) => console.error('Error loading shows:', err)
    });
  }

selectShow(showId: number) {
  const selectedShow = this.shows.find(show => show.id === showId);
  this.modalService.closeShowtimesModal();
  this.router.navigate(['/booking'], { queryParams: { showId, show: selectedShow?.day } });
}

  close() {
    this.modalService.closeShowtimesModal();
  }
}
