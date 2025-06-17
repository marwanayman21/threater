import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClientModule } from '@angular/common/http';
import { Show2Service } from '../Service/show2.service';

@Component({
  selector: 'app-show2times-modal',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './showtimes2model.component.html',
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
export class Showtimes2modelComponent implements OnInit {
  shows: any[] = [];
  isVisible$!: Observable<boolean>;

  constructor(
    private modalService: ModalService,
    private Show2Service: Show2Service,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isVisible$ = this.modalService.showtimesModal$;

    this.Show2Service.getAllShows().subscribe({
      next: (days) => this.shows = days,
      error: (err) => console.error('Error loading Show2:', err)
    });
  }

  selectShow(showId: number) {
    const selectedShow = this.shows.find(s => s.id === showId);
    this.modalService.closeShowtimesModal();
    this.router.navigate(['/booking'], { queryParams: { showId, show: selectedShow?.day } });
  }

  close() {
    this.modalService.closeShowtimesModal();
  }
}
