import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Notification,
  NotificationFactory,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notification`;
  private unreadCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http
      .get<any[]>(this.apiUrl)
      .pipe(
        map((notifications) =>
          notifications.map((n) => NotificationFactory.createFromResponse(n))
        )
      );
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  updateUnreadCount(count: number): void {
    this.unreadCount.next(count);
  }

  // Helper method to get notification icon based on type
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'ConnectionRequest':
        return '👥';
      case 'HabitCheckRequest':
        return '✅';
      case 'ProgressUpdate':
        return '📊';
      default:
        return '📢';
    }
  }
}
