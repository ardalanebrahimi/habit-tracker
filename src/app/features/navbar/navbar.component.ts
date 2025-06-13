import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  unreadCount$: Observable<number>;

  constructor(private notificationService: NotificationService) {
    this.unreadCount$ = this.notificationService.getUnreadCount();
  }

  ngOnInit(): void {
    // Load initial notification count
    this.notificationService.getNotifications().subscribe((notifications) => {
      const unreadCount = notifications.filter((n) => !n.read).length;
      this.notificationService.updateUnreadCount(unreadCount);
    });
  }
}
