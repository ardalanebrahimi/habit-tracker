import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitCardComponent } from '../habit-card/habit-card.component';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { RouterModule } from '@angular/router';
import { HabitsService } from '../../services/habits.service';
import { ConnectionsService } from '../../services/connections.service';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, HabitCardComponent, RouterModule],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss'],
})
export class TodayComponent implements OnInit {
  todayHabits: HabitWithProgressDTO[] = [];
  filteredHabits: HabitWithProgressDTO[] = [];
  friendHabits: HabitWithProgressDTO[] = [];
  currentView: 'remaining' | 'all' | 'done' | 'friends' = 'remaining';
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private habitsService: HabitsService,
    private connectionsService: ConnectionsService
  ) {}

  ngOnInit(): void {
    this.fetchTodayHabits();
  }

  /**
   * ✅ Fetch today's habits and filter based on completion status
   */
  fetchTodayHabits(): void {
    this.isLoading = true;
    this.habitsService.getTodayHabits().subscribe({
      next: (habits) => {
        this.todayHabits = habits;
        this.filterHabits();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Failed to load today's habits. Please try again.";
        console.error("Error fetching today's habits:", err);
        this.isLoading = false;
      },
    });
  }

  fetchFriendHabits(): void {
    this.isLoading = true;
    this.habitsService.getFriendsHabits().subscribe({
      next: (habits) => {
        this.friendHabits = habits;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching friend habits:', err);
        this.isLoading = false;
      },
    });
  }

  /**
   * ✅ Get the progress percentage for numeric habits
   */
  getProgressPercentage(habit: HabitWithProgressDTO): number {
    if (!habit.targetValue) return 0;
    return Math.min(((habit.currentValue || 0) / habit.targetValue) * 100, 100);
  }

  /**
   * ✅ Check if a binary habit is completed
   */
  isHabitDoneToday(habit: HabitWithProgressDTO): boolean {
    return habit.isCompleted ?? false;
  }

  /**
   * ✅ Filter habits based on the selected view (remaining, done, all)
   */
  filterHabits(): void {
    if (this.currentView === 'remaining') {
      this.filteredHabits = this.todayHabits.filter(
        (habit) => !habit.isCompleted
      );
    } else if (this.currentView === 'done') {
      this.filteredHabits = this.todayHabits.filter(
        (habit) => habit.isCompleted
      );
    } else if (this.currentView === 'all') {
      this.filteredHabits = [...this.todayHabits];
    } else if (this.currentView === 'friends') {
      this.fetchFriendHabits();
    }
  }

  /**
   * ✅ Set the habit filter view
   */
  setView(view: 'remaining' | 'all' | 'done' | 'friends'): void {
    this.currentView = view;
    this.filterHabits();
  }

  /**
   * Get the appropriate period text for the streak display
   */
  getStreakPeriod(frequency: 'daily' | 'weekly' | 'monthly'): string {
    switch (frequency) {
      case 'daily':
        return 'days';
      case 'weekly':
        return 'weeks';
      case 'monthly':
        return 'months';
      default:
        return 'days';
    }
  }

  /**
   * Get the appropriate period text for progress display
   */
  getProgressPeriod(frequency: 'daily' | 'weekly' | 'monthly'): string {
    switch (frequency) {
      case 'daily':
        return 'times today';
      case 'weekly':
        return 'times this week';
      case 'monthly':
        return 'times this month';
      default:
        return 'times';
    }
  }
}
