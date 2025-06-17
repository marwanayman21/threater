import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  imagesLoaded: { [key: string]: boolean } = {};
  showModal = false;

  ngOnInit(): void {
    this.preloadImages();
  }

private preloadImages(): void {
  const imageUrls = [
    '../../assets/img/Covor.webp',
    '../../assets/img/poster.webp'
  ];

  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      this.imagesLoaded[url] = true;
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${url}`);
      this.imagesLoaded[url] = true;
    };
  });
}

  onImageLoad(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const parentDiv = imgElement.parentElement;
    if (parentDiv) {
      parentDiv.classList.remove('bg-gray-700', 'animate-pulse');
    }
  }

  isImageLoaded(url: string): boolean {
    return this.imagesLoaded[url] || false;
  }

  openPlayDetails() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
