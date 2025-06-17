import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMenuOpen = false;
  isLoggedIn = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth >= 1024) {
      this.isMenuOpen = false;
    }
  }
    showDropdown = false;
  userInitial = '';
  bgColor = '';


ngOnInit() {
  const userJson = localStorage.getItem('currentUser');
  if (userJson) {
    const user = JSON.parse(userJson);
    const name = user.firstName || 'U';
    this.userInitial = name.charAt(0).toUpperCase();
    this.bgColor = this.getRandomColor();
    this.isLoggedIn = true;
  }
}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

logout() {
  localStorage.clear();
  window.location.href = '/home';
}


  getRandomColor(): string {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500',
      'bg-yellow-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-orange-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
