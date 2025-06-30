import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitCardComponent } from '../habit-card/habit-card.component';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { Router, RouterModule } from '@angular/router';
import { HabitsService } from '../../services/habits.service';
import { ConnectionsService } from '../../services/connections.service';
import { OnboardingService } from '../../services/onboarding.service';

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
  currentView: 'myHabits' | 'friends' = 'myHabits';
  isLoading = true;
  errorMessage: string | null = null;
  showAllOwnedHabits = false;
  showFabOptions = false; // Add this property

  constructor(
    private habitsService: HabitsService,
    private connectionsService: ConnectionsService,
    public onboardingService: OnboardingService,
    private router: Router
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
   * ✅ Filter habits based on the selected view (myHabits, friends)
   */
  filterHabits(): void {
    if (this.currentView === 'myHabits') {
      this.filteredHabits = this.todayHabits.filter(
        (habit) => !habit.isCompleted
      );
    } else if (this.currentView === 'friends') {
      this.fetchFriendHabits();
    }
  }

  /**
   * ✅ Set the habit filter view
   */
  setView(view: 'myHabits' | 'friends'): void {
    this.currentView = view;
    this.filterHabits();
  }

  /**
   * Handle scroll events for "Everyone's Habits" section
   */
  onScroll(event: Event): void {
    // This method is no longer needed since Everyone's habits moved to Explore
    // Keeping for backwards compatibility but can be removed
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

  /**
   * Check if FAB should show additional options
   */
  shouldShowFabOptions(): boolean {
    return this.shouldShowOnboardingFab();
  }

  /**
   * Check if onboarding FAB option should be shown
   */
  shouldShowOnboardingFab(): boolean {
    return (
      this.onboardingService.shouldShowOnboardingPrompts() &&
      this.todayHabits.length < 3
    );
  }

  /**
   * Toggle FAB options visibility
   */
  toggleFabOptions(): void {
    if (this.shouldShowFabOptions()) {
      this.showFabOptions = !this.showFabOptions;
    } else {
      // If no options, go directly to add habit
      this.router.navigate(['/add-habit']);
    }
  }
}
