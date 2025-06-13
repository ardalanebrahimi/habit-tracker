import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { ConnectionsService } from '../../services/connections.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  hasUnreadNotifications = false;

  // Helper methods for username extraction in notifications
  extractUsername(message: string): string {
    // Assumes format like "Username sent you a connection request" or "Username cheered your habit"
    const usernameMatch = message.match(/^([^\s]+)/);
    return usernameMatch ? usernameMatch[1] : '';
  }

  extractMessageWithoutUsername(message: string): string {
    // Returns everything after the username
    const usernameMatch = message.match(/^([^\s]+)\s(.*)/);
    return usernameMatch ? ' ' + usernameMatch[2] : message;
  }

  constructor(
    public notificationService: NotificationService,
    private connectionsService: ConnectionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.hasUnreadNotifications = notifications.some((n) => !n.read);
      },
      error: (error: Error) => {
        console.error('Error loading notifications:', error);
      },
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) => ({
          ...n,
          read: true,
        }));
        this.hasUnreadNotifications = false;
      },
      error: (error: Error) => {
        console.error('Error marking notifications as read:', error);
      },
    });
  }

  handleConnectionRequest(notification: Notification, accept: boolean): void {
    if (!notification.data?.ConnectionId) return;

    this.connectionsService
      .respondToConnectionRequest(notification.data.ConnectionId, accept)
      .subscribe({
        next: () => {
          // Mark notification as read
          this.notificationService.markAsRead(notification.id).subscribe({
            next: () => {
              notification.read = true;
              this.hasUnreadNotifications = this.notifications.some(
                (n) => !n.read
              );
            },
            error: (error: Error) => {
              console.error('Error marking notification as read:', error);
            },
          });
        },
        error: (error: Error) => {
          console.error('Error handling connection request:', error);
        },
      });
  }

  navigateToHabitCheck(notification: Notification): void {
    if (!notification.data?.HabitId) return;

    // Mark notification as read
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.hasUnreadNotifications = this.notifications.some((n) => !n.read);
        // Navigate to habit details page
        this.router.navigate(['/habit', notification.data?.HabitId]);
      },
      error: (error: Error) => {
        console.error('Error marking notification as read:', error);
      },
    });
  }

  navigateToHabitDetails(notification: Notification): void {
    if (!notification.data?.HabitId) return;

    // Mark notification as read
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.hasUnreadNotifications = this.notifications.some((n) => !n.read);
        // Navigate to habit details page
        this.router.navigate(['/habit', notification.data?.HabitId]);
      },
      error: (error: Error) => {
        console.error('Error marking notification as read:', error);
      },
    });
  }
}
