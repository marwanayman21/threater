import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-header-details',
  imports: [],
  templateUrl: './header-details.component.html',
  styleUrl: './header-details.component.css'
})
export class HeaderDetailsComponent {
  constructor(
    private location: Location,
  ) {}

  goBack() {
    this.location.back();
  }
}
