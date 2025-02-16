import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  menuOpen = false;
  isLoading$: Observable<boolean>;

  constructor(
    public authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.isLoading$ = this.loadingService.isLoading.asObservable();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  // Close menu when pressing the Escape key
  @HostListener('document:keydown.escape', [])
  onEscPress() {
    this.closeMenu();
  }
}
