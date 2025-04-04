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
  everyoneHabits: any[] = [];
  currentView: 'myHabits' | 'friends' | 'everyone' = 'myHabits';
  isLoading = true;
  isLoadingEveryone = false;
  errorMessage: string | null = null;
  everyonePage = 1;
  showAllOwnedHabits = false;

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

  fetchEveryoneHabits(): void {
    if (this.isLoadingEveryone) return;

    this.isLoadingEveryone = true;
    this.habitsService
      .getPublicHabits(this.everyonePage)
      .subscribe((response: HabitWithProgressDTO[]) => {
        this.everyoneHabits = [...this.everyoneHabits, ...response];
        this.isLoadingEveryone = false;
        this.everyonePage++;
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
   * ✅ Filter habits based on the selected view (myHabits, friends, everyone)
   */
  filterHabits(): void {
    if (this.currentView === 'myHabits') {
      this.filteredHabits = this.todayHabits.filter(
        (habit) => !habit.isCompleted
      );
    } else if (this.currentView === 'friends') {
      this.fetchFriendHabits();
    } else if (this.currentView === 'everyone') {
      if (this.everyoneHabits.length === 0) {
        this.everyonePage = 1;
        this.fetchEveryoneHabits();
      }
    }
  }

  /**
   * ✅ Set the habit filter view
   */
  setView(view: 'myHabits' | 'friends' | 'everyone'): void {
    this.currentView = view;
    this.filterHabits();
  }

  /**
   * Handle scroll events for "Everyone's Habits" section
   */
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (
      target.scrollTop + target.clientHeight >= target.scrollHeight - 2 &&
      this.currentView === 'everyone'
    ) {
      this.fetchEveryoneHabits();
    }
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
  toggleAllOwnedHabits() {
    this.showAllOwnedHabits = !this.showAllOwnedHabits;

    if (this.showAllOwnedHabits) this.filteredHabits = [...this.todayHabits];
    else
      this.filteredHabits = this.todayHabits.filter(
        (habit) => !habit.isCompleted
      );
  }
}
