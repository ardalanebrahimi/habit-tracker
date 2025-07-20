import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharingService } from '../../services/sharing.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { DialogConfig, DialogResult } from '../../services/dialog.service';

export interface SharingDialogData {
  habit: HabitWithProgressDTO;
}

@Component({
  selector: 'app-sharing-dialog-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sharing-dialog-content.component.html',
  styleUrls: ['./sharing-dialog-content.component.scss'],
})
export class SharingDialogContentComponent {
  @Input() data?: SharingDialogData;
  @Input() config?: DialogConfig;
  @Output() dialogResult = new EventEmitter<DialogResult>();

  isSharing = false;

  constructor(private sharingService: SharingService) {}

  get habit(): HabitWithProgressDTO {
    return this.data!.habit;
  }

  get isMilestone(): boolean {
    return this.sharingService.isMilestone(this.habit.streak);
  }

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

  async shareProgress(): Promise<void> {
    await this.performShare(() =>
      this.sharingService.shareHabitProgress(this.habit)
    );
  }

  async shareStreak(): Promise<void> {
    await this.performShare(() =>
      this.sharingService.shareStreakAchievement(this.habit)
    );
  }

  async shareCompletion(): Promise<void> {
    await this.performShare(() =>
      this.sharingService.shareHabitCompletion(this.habit)
    );
  }

  async shareMilestone(): Promise<void> {
    const milestone = this.sharingService.getMilestone(this.habit.streak);
    if (milestone) {
      await this.performShare(() =>
        this.sharingService.shareMilestone(this.habit, milestone)
      );
    }
  }

  onCancel(): void {
    this.dialogResult.emit({ action: 'cancel' });
  }

  private async performShare(
    shareFunction: () => Promise<void>
  ): Promise<void> {
    if (this.isSharing) return;

    this.isSharing = true;

    try {
      await shareFunction();
      this.dialogResult.emit({
        action: 'confirm',
        data: { shared: true },
      });
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      this.isSharing = false;
    }
  }
}
