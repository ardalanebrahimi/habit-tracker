import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { HabitsService } from '../../services/habits.service';
import { HabitQuickShareComponent } from '../habit-quick-share/habit-quick-share.component';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule, RouterModule, HabitQuickShareComponent],
  templateUrl: './habit-card.component.html',
  styleUrls: ['./habit-card.component.scss'],
})
export class HabitCardComponent {
  @Input() habit!: HabitWithProgressDTO;
  @Input() isReadOnly = false;
  @Output() habitChanged = new EventEmitter<void>();
  /**
   *
   */
  constructor(private habitsService: HabitsService) {}

  getStreakPeriod(): string {
    switch (this.habit.frequency) {
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

  getProgressPeriod(): string {
    switch (this.habit.frequency) {
      case 'daily':
        return 'today';
      case 'weekly':
        return 'this week';
      case 'monthly':
        return 'this month';
      default:
        return 'today';
    }
  }

  getProgressPercentage(): number {
    if (!this.habit.targetValue) return 0;
    return ((this.habit.currentValue || 0) / this.habit.targetValue) * 100;
  }

  isHabitDoneToday(): boolean {
    if (this.habit.goalType === 'binary') {
      return this.habit.isCompleted;
    }
    return (this.habit.currentValue || 0) >= (this.habit.targetValue || 0);
  }

  toggleHabitCompletion(event: Event): void {
    if (this.isReadOnly) return;

    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.habitsService.updateHabitProgress(this.habit.id!, false).subscribe({
        next: () => this.habitChanged.emit(),
        error: (err) => console.error('Error marking habit as complete:', err),
      });
    } else {
      this.habitsService.updateHabitProgress(this.habit.id!, true).subscribe({
        next: () => this.habitChanged.emit(),
        error: (err) => console.error('Error undoing habit:', err),
      });
    }
  }

  incrementProgress(): void {
    if (this.isReadOnly) return;

    this.habitsService.updateHabitProgress(this.habit.id!, false).subscribe({
      next: () => this.habitChanged.emit(),
      error: (err) => console.error('Error increasing progress:', err),
    });
  }

  decrementProgress(): void {
    if (this.isReadOnly) return;

    this.habitsService.updateHabitProgress(this.habit.id!, true).subscribe({
      next: () => this.habitChanged.emit(),
      error: (err) => console.error('Error decreasing progress:', err),
    });
  }
}
