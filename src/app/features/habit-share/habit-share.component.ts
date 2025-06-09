import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharingService } from '../../services/sharing.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-habit-share',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="share-container">
      <!-- Share Progress Button -->
      <button
        class="share-btn progress-share"
        (click)="shareProgress()"
        title="Share your progress"
        [disabled]="isSharing"
      >
        <span class="icon">📊</span>
        <span class="text">Share Progress</span>
      </button>

      <!-- Share Streak Button (only if streak > 0) -->
      <button
        *ngIf="habit.streak > 0"
        class="share-btn streak-share"
        (click)="shareStreak()"
        title="Share your streak"
        [disabled]="isSharing"
      >
        <span class="icon">🔥</span>
        <span class="text">Share Streak</span>
      </button>

      <!-- Share Completion Button (only if completed today) -->
      <button
        *ngIf="habit.isCompleted"
        class="share-btn completion-share"
        (click)="shareCompletion()"
        title="Share today's completion"
        [disabled]="isSharing"
      >
        <span class="icon">✅</span>
        <span class="text">Share Achievement</span>
      </button>

      <!-- Share Milestone Button (only if milestone reached) -->
      <button
        *ngIf="isMilestone"
        class="share-btn milestone-share"
        (click)="shareMilestone()"
        title="Share milestone achievement"
        [disabled]="isSharing"
      >
        <span class="icon">🏆</span>
        <span class="text">Share Milestone</span>
      </button>
    </div>
  `,
  styles: [
    `
      .share-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 12px 0;
      }

      .share-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: fit-content;
      }

      .share-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .progress-share {
        background: #17a2b8;
        color: white;
      }

      .progress-share:hover:not(:disabled) {
        background: #138496;
        transform: translateY(-1px);
      }

      .streak-share {
        background: #fd7e14;
        color: white;
      }

      .streak-share:hover:not(:disabled) {
        background: #e8690b;
        transform: translateY(-1px);
      }

      .completion-share {
        background: #28a745;
        color: white;
      }

      .completion-share:hover:not(:disabled) {
        background: #218838;
        transform: translateY(-1px);
      }

      .milestone-share {
        background: #ffc107;
        color: #212529;
      }

      .milestone-share:hover:not(:disabled) {
        background: #e0a800;
        transform: translateY(-1px);
      }

      .icon {
        font-size: 16px;
      }

      .text {
        font-size: 13px;
      }

      @media (max-width: 480px) {
        .share-container {
          flex-direction: column;
        }

        .share-btn {
          justify-content: center;
          width: 100%;
        }
      }
    `,
  ],
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
