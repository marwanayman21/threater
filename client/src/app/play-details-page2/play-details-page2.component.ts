import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ModalService } from '../services/modal.service'; // تأكد من المسار الصح
import { SomeButtonComponent } from '../some-button/some-button.component';
import { HeaderDetailsComponent } from '../shared/header-details/header-details.component';
import { Showtimes2modelComponent } from '../showtimes2model/showtimes2model.component';

@Component({
  selector: 'app-play-details-page',
  imports: [SomeButtonComponent, Showtimes2modelComponent, HeaderDetailsComponent],
  templateUrl: './play-details-page2.component.html',
  styleUrls: ['./play-details-page2.component.css']
})
export class PlayDetailsPageComponent2 {
  constructor(
    private location: Location,
    private modalService: ModalService // ✅ تم إضافته هنا
  ) {}

  openModal() {
    this.modalService.openShowtimesModal(); // ✅ دلوقتي تشتغل بدون خطأ
  }
}
