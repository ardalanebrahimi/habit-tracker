import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharingService } from '../../services/sharing.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-milestone-celebration',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="celebration-overlay"
      *ngIf="showCelebration"
      (click)="closeCelebration()"
    >
      <div class="celebration-modal" (click)="$event.stopPropagation()">
        <div class="celebration-content">
          <div class="celebration-icon">🎉</div>
          <h2>Milestone Achieved!</h2>
          <p class="milestone-text">
            Congratulations! You've reached <strong>{{ milestone }}</strong>
            {{ getFrequencyText() }} of <strong>{{ habit.name }}</strong
            >!
          </p>
          <div class="streak-display">
            🔥 {{ habit.streak }} {{ getFrequencyText() }} streak!
          </div>

          <div class="celebration-actions">
            <button
              class="btn share-btn"
              (click)="shareMilestone()"
              [disabled]="isSharing"
            >
              📤 Share Achievement
            </button>
            <button class="btn continue-btn" (click)="closeCelebration()">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .celebration-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .celebration-modal {
        background: white;
        padding: 32px;
        border-radius: 16px;
        text-align: center;
        max-width: 400px;
        margin: 20px;
        animation: scaleIn 0.3s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      @keyframes scaleIn {
        from {
          transform: scale(0.8);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .celebration-icon {
        font-size: 64px;
        margin-bottom: 16px;
        animation: bounce 0.6s ease infinite alternate;
      }

      @keyframes bounce {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(-10px);
        }
      }

      h2 {
        color: #2c3e50;
        margin: 0 0 16px 0;
        font-size: 28px;
        font-weight: 700;
      }

      .milestone-text {
        color: #6c757d;
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 20px;
      }

      .streak-display {
        background: linear-gradient(135deg, #ff6b6b, #ffa500);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 600;
        font-size: 18px;
        margin: 20px 0;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
      }

      .celebration-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 24px;
      }

      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
      }

      .share-btn {
        background: #17a2b8;
        color: white;
      }

      .share-btn:hover:not(:disabled) {
        background: #138496;
        transform: translateY(-2px);
      }

      .share-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .continue-btn {
        background: #28a745;
        color: white;
      }

      .continue-btn:hover {
        background: #218838;
        transform: translateY(-2px);
      }

      @media (max-width: 480px) {
        .celebration-modal {
          margin: 10px;
          padding: 24px;
        }

        .celebration-actions {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class MilestoneCelebrationComponent implements OnInit {
  @Input() habit!: HabitWithProgressDTO;
  @Input() milestone!: number;
  @Input() showCelebration = false;
  @Output() celebrationClosed = new EventEmitter<void>();
  @Output() milestoneShared = new EventEmitter<void>();

  isSharing = false;

  constructor(private sharingService: SharingService) {}

  ngOnInit(): void {
    // Auto-close after 10 seconds if user doesn't interact
    if (this.showCelebration) {
      setTimeout(() => {
        if (this.showCelebration) {
          this.closeCelebration();
        }
      }, 10000);
    }
  }

  getFrequencyText(): string {
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

  async shareMilestone(): Promise<void> {
    if (this.isSharing) return;

    this.isSharing = true;
    try {
      await this.sharingService.shareMilestone(this.habit, this.milestone);
      this.milestoneShared.emit();
      this.closeCelebration();
    } catch (error) {
      console.error('Error sharing milestone:', error);
    } finally {
      this.isSharing = false;
    }
  }

  closeCelebration(): void {
    this.showCelebration = false;
    this.celebrationClosed.emit();
  }
}
