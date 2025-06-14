import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { StatsComponent } from '../stats/stats.component';
import { AllHabitsComponent } from '../all-habits/all-habits.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, StatsComponent, AllHabitsComponent],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent {
  currentView: 'habits' | 'stats' = 'habits';

  constructor(private authService: AuthService, private router: Router) {}

  setView(view: 'habits' | 'stats'): void {
    this.currentView = view;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
