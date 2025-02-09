import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  menuOpen = false;

  constructor(public authService: AuthService, private router: Router) {}
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
