import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
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

  constructor(
    private notificationService: NotificationService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.unreadCount$ = this.notificationService.getUnreadCount();
  }

  ngOnInit(): void {
    // Load initial notification count
    this.notificationService.getNotifications().subscribe((notifications) => {
      const unreadCount = notifications.filter((n) => !n.read).length;
      this.notificationService.updateUnreadCount(unreadCount);
    });

    // Add ripple effect to nav items
    this.addRippleEffects();
  }

  private addRippleEffects(): void {
    const navItems =
      this.elementRef.nativeElement.querySelectorAll('.nav-item');

    navItems.forEach((item: HTMLElement) => {
      this.renderer.listen(item, 'click', (event: MouseEvent) => {
        this.createRipple(event, item);
      });
    });
  }

  private createRipple(event: MouseEvent, element: HTMLElement): void {
    const ripple = this.renderer.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    this.renderer.addClass(ripple, 'ripple');
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${x}px`);
    this.renderer.setStyle(ripple, 'top', `${y}px`);

    this.renderer.appendChild(element, ripple);

    // Remove ripple after animation
    setTimeout(() => {
      if (element.contains(ripple)) {
        this.renderer.removeChild(element, ripple);
      }
    }, 600);
  }
}
