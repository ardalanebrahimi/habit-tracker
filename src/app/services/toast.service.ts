import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  private toasts$ = this.toastsSubject.asObservable();
  private defaultDuration = 5000; // 5 seconds

  constructor() {}

  /**
   * Get observable of current toasts
   */
  getToasts(): Observable<ToastMessage[]> {
    return this.toasts$;
  }

  /**
   * Show success toast
   */
  showSuccess(title: string, message: string, duration?: number): void {
    this.addToast('success', title, message, duration);
  }

  /**
   * Show error toast
   */
  showError(title: string, message: string, duration?: number): void {
    this.addToast('error', title, message, duration);
  }

  /**
   * Show warning toast
   */
  showWarning(title: string, message: string, duration?: number): void {
    this.addToast('warning', title, message, duration);
  }

  /**
   * Show info toast
   */
  showInfo(title: string, message: string, duration?: number): void {
    this.addToast('info', title, message, duration);
  }

  /**
   * Remove a specific toast
   */
  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.getValue();
    const updatedToasts = currentToasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Clear all toasts
   */
  clearAll(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Add a new toast
   */
  private addToast(
    type: ToastMessage['type'],
    title: string,
    message: string,
    duration?: number
  ): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: duration || this.defaultDuration,
      timestamp: new Date(),
    };

    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next([...currentToasts, toast]); // Auto-remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }
  }

  /**
   * Generate unique ID for toast
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
