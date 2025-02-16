import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../../services/habits.service';
import { CommonModule } from '@angular/common';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss'],
})
export class TodayComponent implements OnInit {
  todayHabits: HabitWithProgressDTO[] = [];
  filteredHabits: HabitWithProgressDTO[] = [];
  currentView: 'remaining' | 'all' | 'done' = 'remaining';
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.fetchTodayHabits();
  }

  /**
   * ✅ Fetch today's habits and filter based on completion status
   */
  private fetchTodayHabits(): void {
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

  /**
   * ✅ Mark binary habit as completed
   */
  markHabitComplete(habit: HabitWithProgressDTO): void {
    if (!habit.isCompleted) {
      this.habitsService.updateHabitProgress(habit.id!, false).subscribe({
        next: () => this.fetchTodayHabits(),
        error: (err) => console.error('Error marking habit as complete:', err),
      });
    }
  }

  /**
   * ✅ Undo completion of a binary habit
   */
  undoHabitDoneToday(habit: HabitWithProgressDTO): void {
    this.habitsService.updateHabitProgress(habit.id!, true).subscribe({
      next: () => this.fetchTodayHabits(),
      error: (err) => console.error('Error undoing habit:', err),
    });
  }

  /**
   * ✅ Increase numeric progress
   */
  incrementProgress(habit: HabitWithProgressDTO): void {
    if (!habit.isCompleted) {
      this.habitsService.updateHabitProgress(habit.id!, false).subscribe({
        next: () => this.fetchTodayHabits(),
        error: (err) => console.error('Error increasing progress:', err),
      });
    }
  }

  /**
   * ✅ Decrease numeric progress
   */
  decrementProgress(habit: HabitWithProgressDTO): void {
    this.habitsService.updateHabitProgress(habit.id!, true).subscribe({
      next: () => this.fetchTodayHabits(),
      error: (err) => console.error('Error decreasing progress:', err),
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
    } else {
      this.filteredHabits = [...this.todayHabits];
    }
  }

  /**
   * ✅ Set the habit filter view
   */
  setView(view: 'remaining' | 'all' | 'done'): void {
    this.currentView = view;
    this.filterHabits();
  }
}
