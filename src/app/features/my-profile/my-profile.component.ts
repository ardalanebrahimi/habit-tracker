import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HabitsService } from '../../services/habits.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { StatsComponent } from '../stats/stats.component';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, UserProfileComponent, StatsComponent],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
  userId: string | null = null;
  habits: HabitWithProgressDTO[] = [];
  isLoading = true;
  currentView: 'profile' | 'habits' | 'stats' = 'profile';
  constructor(
    private authService: AuthService,
    private habitsService: HabitsService
  ) {
    // We'll use the profile view to get the user ID
    this.userId = 'me'; // Use 'me' as a placeholder
  }

  ngOnInit(): void {
    this.fetchHabits();
  }

  fetchHabits(): void {
    if (!this.userId) return;

    this.isLoading = true;
    this.habitsService.getActiveHabits().subscribe({
      next: (habits) => {
        this.habits = habits;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching habits:', error);
        this.isLoading = false;
      },
    });
  }

  setView(view: 'profile' | 'habits' | 'stats'): void {
    this.currentView = view;
  }
}
