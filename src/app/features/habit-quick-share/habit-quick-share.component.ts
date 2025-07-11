import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharingService } from '../../services/sharing.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-habit-quick-share',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-quick-share.component.html',
  styleUrls: ['./habit-quick-share.component.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class HabitQuickShareComponent {
  @Input() habit!: HabitWithProgressDTO;

  showShareMenu = false;
  isSharing = false;

  constructor(private sharingService: SharingService) {}

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

  toggleShareMenu(): void {
    this.showShareMenu = !this.showShareMenu;
  }

  onDocumentClick(event: Event): void {
    this.showShareMenu = false;
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

  private async performShare(
    shareFunction: () => Promise<void>
  ): Promise<void> {
    if (this.isSharing) return;

    this.isSharing = true;
    this.showShareMenu = false;

    try {
      await shareFunction();
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      this.isSharing = false;
    }
  }
}
