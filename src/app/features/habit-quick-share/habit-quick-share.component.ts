import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharingService } from '../../services/sharing.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-habit-quick-share',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quick-share" *ngIf="habit.isOwnedHabit && !habit.isPrivate">
      <button
        class="quick-share-btn"
        (click)="toggleShareMenu()"
        [class.active]="showShareMenu"
        title="Share this habit"
        [disabled]="isSharing"
      >
        📤
      </button>

      <div
        class="share-menu"
        *ngIf="showShareMenu"
        (click)="$event.stopPropagation()"
      >
        <button
          class="share-option"
          (click)="shareCompletion()"
          *ngIf="habit.isCompleted"
          [disabled]="isSharing"
        >
          ✅ Share Achievement
        </button>

        <button
          class="share-option"
          (click)="shareStreak()"
          *ngIf="habit.streak > 0"
          [disabled]="isSharing"
        >
          🔥 Share Streak
        </button>

        <button
          class="share-option"
          (click)="shareProgress()"
          [disabled]="isSharing"
        >
          📊 Share Progress
        </button>

        <button
          class="share-option milestone"
          (click)="shareMilestone()"
          *ngIf="isMilestone"
          [disabled]="isSharing"
        >
          🏆 Share Milestone
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .quick-share {
        position: relative;
        display: inline-block;
      }

      .quick-share-btn {
        background: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 28px;
        height: 28px;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .quick-share-btn:hover:not(:disabled) {
        background: #f8f9fa;
        border-color: #17a2b8;
      }

      .quick-share-btn.active {
        background: #17a2b8;
        color: white;
        border-color: #17a2b8;
      }

      .quick-share-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .share-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 140px;
        padding: 4px 0;
        margin-top: 4px;
      }

      .share-option {
        display: block;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: none;
        text-align: left;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s ease;
        white-space: nowrap;
      }

      .share-option:hover:not(:disabled) {
        background: #f8f9fa;
      }

      .share-option:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .share-option.milestone {
        color: #856404;
        font-weight: 600;
      }

      /* Click outside to close */
      :host {
        display: contents;
      }
    `,
  ],
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
