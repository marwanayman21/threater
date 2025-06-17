import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-navbar',
  imports: [CommonModule],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {
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
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    localStorage.removeItem('currentUser');
    // توجهي للّوجين مثلا
    window.location.href = '/login';
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

