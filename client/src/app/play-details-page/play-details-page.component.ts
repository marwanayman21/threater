import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ModalService } from '../services/modal.service'; // تأكد من المسار الصح
import { SomeButtonComponent } from '../some-button/some-button.component';
import { ShowtimesModalComponent } from '../showtimes-modal/showtimes-modal.component';
import { HeaderDetailsComponent } from '../shared/header-details/header-details.component';

@Component({
  selector: 'app-play-details-page',
  imports: [SomeButtonComponent, ShowtimesModalComponent, HeaderDetailsComponent],
  templateUrl: './play-details-page.component.html',
  styleUrls: ['./play-details-page.component.css']
})
export class PlayDetailsPageComponent {
  constructor(
    private location: Location,
    private modalService: ModalService // ✅ تم إضافته هنا
  ) {}

  openModal() {
    this.modalService.openShowtimesModal(); // ✅ دلوقتي تشتغل بدون خطأ
  }
}
