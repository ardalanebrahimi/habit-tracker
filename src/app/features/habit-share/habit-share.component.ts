import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharingService } from '../../services/sharing.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-habit-share',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-share.component.html',
  styleUrls: ['./habit-share.component.scss'],
})
export class HabitShareComponent {
  @Input() habit!: HabitWithProgressDTO;
  @Output() shareCompleted = new EventEmitter<string>();

  isSharing = false;

  constructor(private sharingService: SharingService) {}

  get isMilestone(): boolean {
    return this.sharingService.isMilestone(this.habit.streak);
  }

  async shareProgress(): Promise<void> {
    await this.performShare('progress', () =>
      this.sharingService.shareHabitProgress(this.habit)
    );
  }

  async shareStreak(): Promise<void> {
    await this.performShare('streak', () =>
      this.sharingService.shareStreakAchievement(this.habit)
    );
  }

  async shareCompletion(): Promise<void> {
    await this.performShare('completion', () =>
      this.sharingService.shareHabitCompletion(this.habit)
    );
  }

  async shareMilestone(): Promise<void> {
    const milestone = this.sharingService.getMilestone(this.habit.streak);
    if (milestone) {
      await this.performShare('milestone', () =>
        this.sharingService.shareMilestone(this.habit, milestone)
      );
    }
  }

  private async performShare(
    type: string,
    shareFunction: () => Promise<void>
  ): Promise<void> {
    if (this.isSharing) return;

    this.isSharing = true;
    try {
      await shareFunction();
      this.shareCompleted.emit(type);
    } catch (error) {
      console.error(`Error sharing ${type}:`, error);
    } finally {
      this.isSharing = false;
    }
  }
}
