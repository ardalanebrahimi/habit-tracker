import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { HabitsService } from '../../services/habits.service';
import { MilestoneService } from '../../services/milestone.service';
import { HabitQuickShareComponent } from '../habit-quick-share/habit-quick-share.component';
import { MilestoneCelebrationComponent } from '../milestone-celebration/milestone-celebration.component';
import { MilestoneDefinition } from '../../models/milestone.model';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HabitQuickShareComponent,
    MilestoneCelebrationComponent,
  ],
  templateUrl: './habit-card.component.html',
  styleUrls: ['./habit-card.component.scss'],
})
export class HabitCardComponent {
  @Input() habit!: HabitWithProgressDTO;
  @Input() isReadOnly = false;
  @Output() habitChanged = new EventEmitter<void>();

  // Milestone celebration properties
  showMilestoneCelebration = false;
  currentMilestone: MilestoneDefinition | null = null;

  constructor(
    private habitsService: HabitsService,
    private milestoneService: MilestoneService
  ) {}

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
    const previousStreak = this.habit.streak;

    if (isChecked) {
      this.habitsService.updateHabitProgress(this.habit.id!, false).subscribe({
        next: () => {
          // Update habit streak optimistically (assuming success)
          this.habit.streak = previousStreak + 1;
          this.habit.isCompleted = true;

          // Check for milestone after completion
          this.checkForMilestone(previousStreak);
          this.habitChanged.emit();
        },
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

    const previousStreak = this.habit.streak;
    const wasCompleted = this.isHabitDoneToday();

    this.habitsService.updateHabitProgress(this.habit.id!, false).subscribe({
      next: () => {
        // Update habit values optimistically
        if (this.habit.currentValue !== undefined) {
          this.habit.currentValue += 1;
        }

        const isNowCompleted = this.isHabitDoneToday();

        // Check for milestone only if habit just became completed
        if (!wasCompleted && isNowCompleted) {
          this.habit.streak = previousStreak + 1;
          this.habit.isCompleted = true;
          this.checkForMilestone(previousStreak);
        }
        this.habitChanged.emit();
      },
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

  private checkForMilestone(previousStreak: number): void {
    const milestoneResult = this.milestoneService.checkForNewMilestone(
      this.habit,
      previousStreak
    );

    if (milestoneResult.isNewMilestone && milestoneResult.milestone) {
      // Record the milestone achievement
      this.milestoneService
        .recordMilestone(this.habit, milestoneResult.milestone)
        .subscribe({
          next: () => {
            // Show celebration
            this.currentMilestone = milestoneResult.milestone!;
            this.showMilestoneCelebration = true;
          },
          error: (err) => console.error('Error recording milestone:', err),
        });
    }
  }

  onMilestoneCelebrationClosed(): void {
    this.showMilestoneCelebration = false;
    this.currentMilestone = null;
  }
}
