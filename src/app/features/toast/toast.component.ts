import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService
      .getToasts()
      .subscribe((toasts) => (this.toasts = toasts));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Remove a toast
   */
  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  /**
   * Get icon for toast type
   */
  getIcon(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  }
  /**
   * Get CSS class for toast type
   */
  getToastClass(type: ToastMessage['type']): string {
    return `toast-${type}`;
  }

  /**
   * TrackBy function for toast list
   */
  trackByToastId(index: number, toast: ToastMessage): string {
    return toast.id;
  }
}
