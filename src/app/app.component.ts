import {
  Component,
  ChangeDetectorRef,
  HostListener,
  OnInit,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LoadingService } from './services/loading.service';
import { NotificationService } from './services/notification.service';
import { ToastComponent } from './features/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  menuOpen = false;
  isLoading$: Observable<boolean>;
  unreadCount$: Observable<number>;

  constructor(
    public authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoading$ = this.loadingService.isLoading.asObservable();
    this.unreadCount$ = this.notificationService.getUnreadCount();
  }

  ngOnInit(): void {
    // Load initial notification count
    this.notificationService.getNotifications().subscribe((notifications) => {
      const unreadCount = notifications.filter((n) => !n.read).length;
      this.notificationService.updateUnreadCount(unreadCount);
    });
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
