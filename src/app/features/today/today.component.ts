import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../../services/habits.service';
import { Habit } from '../../models/habit.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss'],
})
export class TodayComponent implements OnInit {
  todayHabits: Habit[] = [];
  filteredHabits: Habit[] = [];
  currentView: 'remaining' | 'all' | 'done' = 'remaining';
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.fetchTodayHabits();
  }

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

  isHabitDoneToday(habit: Habit): boolean {
    const today = new Date().toISOString().split('T')[0];
    return habit.logs.some((log) => log.date === today);
  }

  markHabitComplete(habit: Habit): void {
    if (!this.isHabitDoneToday(habit)) {
      this.habitsService.markHabitComplete(habit.id).subscribe({
        next: () => this.fetchTodayHabits(),
        error: (err) => console.error('Error marking habit as complete:', err),
      });
    }
  }

  undoHabitDoneToday(habit: Habit): void {
    habit.logs = habit.logs.filter(
      (log) => log.date !== new Date().toISOString().split('T')[0]
    );
    this.habitsService.updateHabit(habit).subscribe({
      next: () => this.fetchTodayHabits(),
      error: (err) => console.error('Error undoing habit:', err),
    });
  }

  incrementProgress(habit: Habit): void {
    habit.currentValue = (habit.currentValue || 0) + 1;
    if (habit.currentValue >= (habit.targetValue || 0)) {
      this.markHabitComplete(habit);
    } else {
      this.habitsService.updateHabit(habit).subscribe({
        next: () => this.fetchTodayHabits(),
        error: (err) => console.error('Error updating numeric progress:', err),
      });
    }
  }

  decrementProgress(habit: Habit): void {
    if (habit.currentValue && habit.currentValue > 0) {
      habit.currentValue--;
      if (habit.currentValue < (habit.targetValue || 0)) {
        this.habitsService.updateHabit(habit).subscribe({
          next: () => this.fetchTodayHabits(),
          error: (err) => console.error('Error decrementing progress:', err),
        });
      }
    }
  }

  getProgressPercentage(habit: Habit): number {
    if (!habit.targetValue) return 0;
    return Math.min(((habit.currentValue || 0) / habit.targetValue) * 100, 100);
  }

  filterHabits(): void {
    if (this.currentView === 'remaining') {
      this.filteredHabits = this.todayHabits.filter(
        (habit) => !this.isHabitDoneToday(habit)
      );
    } else if (this.currentView === 'done') {
      this.filteredHabits = this.todayHabits.filter((habit) =>
        this.isHabitDoneToday(habit)
      );
    } else {
      this.filteredHabits = [...this.todayHabits];
    }
  }

  setView(view: 'remaining' | 'all' | 'done'): void {
    this.currentView = view;
    this.filterHabits();
  }
}
