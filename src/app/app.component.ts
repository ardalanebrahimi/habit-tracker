// filepath: c:\Users\ardal\habit-tracker\src\app\app.component.ts
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { BillingService } from './services/billing.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LoadingService } from './services/loading.service';
import { ToastComponent } from './features/toast/toast.component';
import { NavbarComponent } from './features/navbar/navbar.component';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { NavigationService } from './services/navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoading$: Observable<boolean>;

  constructor(
    public authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private navigationService: NavigationService,
    private billingService: BillingService
  ) {
    this.isLoading$ = this.loadingService.isLoading.asObservable();
  }

  ngOnInit(): void {
    this.initializeBackButtonHandling();
    this.initializeBilling();
  }

  private async initializeBilling(): Promise<void> {
    try {
      await this.billingService.initializeBilling();
    } catch (error) {
      console.error('Failed to initialize billing:', error);
    }
  }

  ngAfterViewInit() {
    this.isLoading$.subscribe(() => {
      this.cdr.detectChanges(); // ✅ Force UI update to avoid ExpressionChangedAfterItHasBeenCheckedError
    });
  }

  private initializeBackButtonHandling(): void {
    if (Capacitor.getPlatform() === 'android') {
      App.addListener('backButton', () => {
        this.handleBackButton();
      });
    }
  }

  private handleBackButton(): void {
    this.navigationService.handleBackNavigation();
  }

  isAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/login' || currentUrl === '/register';
  }

  logout(): void {
    this.authService.logout();
    this.navigationService.clearHistory();
    this.router.navigate(['/login']);
  }
}
