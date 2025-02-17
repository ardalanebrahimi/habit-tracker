import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
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
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoading$ = this.loadingService.isLoading.asObservable();
  }

  ngAfterViewInit() {
    this.isLoading$.subscribe(() => {
      this.cdr.detectChanges(); // ✅ Force UI update to avoid ExpressionChangedAfterItHasBeenCheckedError
    });
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
