import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../habits.service';
import { Habit } from '../habit.model';
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

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.todayHabits = this.habitsService.getTodayHabits();
    this.filterHabits();
  }

  isHabitDoneToday(habit: Habit): boolean {
    const today = new Date().toISOString().split('T')[0];
    return habit.logs.some((log) => log.date === today);
  }

  markHabitComplete(habit: Habit): void {
    const today = new Date().toISOString().split('T')[0];
    if (!this.isHabitDoneToday(habit)) {
      habit.logs.push({ date: today, value: 1 });
      habit.streak++;
      this.habitsService.updateHabit(habit);
    }
    this.filterHabits();
  }

  undoHabitDoneToday(habit: Habit): void {
    const today = new Date().toISOString().split('T')[0];
    habit.logs = habit.logs.filter((log) => log.date !== today);
    habit.streak = this.habitsService.calculateStreak(habit); // Recalculate streak
    this.habitsService.updateHabit(habit);
    this.filterHabits();
  }

  incrementProgress(habit: Habit): void {
    habit.currentValue = (habit.currentValue || 0) + 1;
    if (habit.currentValue >= (habit.targetValue || 0)) {
      const today = new Date().toISOString().split('T')[0];
      habit.logs.push({ date: today, value: habit.currentValue });
      habit.streak++;
    }
    this.habitsService.updateHabit(habit);
    this.filterHabits();
  }

  decrementProgress(habit: Habit): void {
    if (habit.currentValue && habit.currentValue > 0) {
      habit.currentValue--;
      if (habit.currentValue < (habit.targetValue || 0)) {
        const today = new Date().toISOString().split('T')[0];
        habit.logs = habit.logs.filter((log) => log.date !== today);
        habit.streak = this.habitsService.calculateStreak(habit); // Recalculate streak
      }
      this.habitsService.updateHabit(habit);
      this.filterHabits();
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
