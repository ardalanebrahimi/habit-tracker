import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheeringService } from '../../services/cheering.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import {
  CheerRequest,
  CHEER_EMOJIS,
  CHEER_MESSAGES,
} from '../../models/cheer.model';

@Component({
  selector: 'app-cheer-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cheer-container" *ngIf="canShowCheerButton">
      <!-- Modern Cheer Button -->
      <button
        class="modern-cheer-btn"
        (click)="toggleCheerModal()"
        [class.active]="showCheerModal"
        [disabled]="isSubmitting"
        title="Send encouragement"
      >
        <svg class="cheer-icon" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="currentColor"
          />
        </svg>
        <span class="cheer-text">Cheer</span>
      </button>

      <!-- Modern Cheer Modal -->
      <div
        class="modern-cheer-modal"
        *ngIf="showCheerModal"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <div class="header-content">
            <div class="celebration-icon">🎉</div>
            <div class="header-text">
              <h4>Cheer for {{ habit.userName }}!</h4>
              <p>Show your support for their progress</p>
            </div>
          </div>
          <button class="modern-close-btn" (click)="closeCheerModal()">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="habit-info-card">
            <div class="habit-details">
              <strong class="habit-name">{{ habit.name }}</strong>
              <span class="completion-status" *ngIf="habit.isCompleted">
                <svg class="check-icon" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12L10 17L20 7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Completed!
              </span>
            </div>
          </div>

          <!-- Modern Emoji Selection -->
          <div class="selection-section">
            <label class="section-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Choose your reaction
            </label>
            <div class="emoji-selection">
              <button
                *ngFor="let emojiItem of cheerEmojis"
                class="modern-emoji-btn"
                [class.selected]="selectedEmoji === emojiItem.emoji"
                (click)="selectEmoji(emojiItem.emoji)"
                [title]="emojiItem.label"
              >
                {{ emojiItem.emoji }}
              </button>
            </div>
          </div>

          <!-- Modern Message Selection -->
          <div class="selection-section">
            <label class="section-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              Add a message
            </label>
            <div class="message-pills">
              <button
                *ngFor="let msg of cheerMessages"
                class="message-pill"
                [class.selected]="selectedMessage === msg"
                (click)="selectMessage(msg)"
              >
                {{ msg }}
              </button>
            </div>
            <div class="custom-input-container">
              <input
                type="text"
                class="modern-input"
                [(ngModel)]="customMessage"
                placeholder="Or write your own message..."
                maxlength="100"
                (input)="onCustomMessageChange()"
              />
              <div class="input-char-count">
                {{ customMessage.length || 0 }}/100
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modern-btn secondary" (click)="closeCheerModal()">
            Cancel
          </button>
          <button
            class="modern-btn primary"
            (click)="sendCheer()"
            [disabled]="!canSendCheer || isSubmitting"
          >
            <svg
              class="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              *ngIf="!isSubmitting"
            >
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="spinner" *ngIf="isSubmitting"></div>
            <span>{{ isSubmitting ? 'Sending...' : 'Send Cheer' }}</span>
            <span
              class="selected-emoji"
              *ngIf="selectedEmoji && !isSubmitting"
              >{{ selectedEmoji }}</span
            >
          </button>
        </div>
      </div>
    </div>

    <!-- Modern Backdrop -->
    <div
      class="modern-backdrop"
      *ngIf="showCheerModal"
      (click)="closeCheerModal()"
    ></div>
  `,
  styles: [
    `
      /* Modern Cheer Button Component Styles */
      .cheer-container {
        position: relative;
        display: inline-block;
      }

      .modern-cheer-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        border: none;
        border-radius: 20px;
        padding: 8px 12px;
        color: white;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);

        .cheer-icon {
          width: 14px;
          height: 14px;
        }

        .cheer-text {
          font-size: 12px;
        }

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        &:active {
          transform: translateY(0);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        &.active {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        }
      }

      .modern-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 1000;
        animation: backdropFadeIn 0.2s ease;
      }

      .modern-cheer-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        width: 90%;
        max-width: 420px;
        max-height: 85vh;
        overflow: hidden;
        animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24px;
        background: linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%);
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;

          .celebration-icon {
            font-size: 32px;
            animation: bounce 2s infinite;
          }

          .header-text {
            h4 {
              margin: 0 0 4px 0;
              font-size: 18px;
              font-weight: 700;
              color: #1f2937;
            }

            p {
              margin: 0;
              font-size: 13px;
              color: #6b7280;
            }
          }
        }

        .modern-close-btn {
          background: none;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;

          svg {
            width: 18px;
            height: 18px;
          }

          &:hover {
            background: rgba(0, 0, 0, 0.1);
            color: #374151;
          }
        }
      }

      .modal-body {
        padding: 24px;
        overflow-y: auto;
        max-height: calc(85vh - 200px);
      }

      .habit-info-card {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 24px;

        .habit-details {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .habit-name {
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
          }

          .completion-status {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #10b981;
            color: white;
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;

            .check-icon {
              width: 14px;
              height: 14px;
            }
          }
        }
      }

      .selection-section {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;

          .label-icon {
            width: 16px;
            height: 16px;
            color: #6b7280;
          }
        }
      }

      .emoji-selection {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 8px;
      }

      .modern-emoji-btn {
        background: #f9fafb;
        border: 2px solid transparent;
        border-radius: 12px;
        padding: 12px;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #f3f4f6;
          transform: scale(1.05);
          border-color: #e5e7eb;
        }

        &.selected {
          border-color: #4f46e5;
          background: #ede9fe;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
      }

      .message-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }

      .message-pill {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        padding: 8px 14px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: #374151;
        transition: all 0.2s ease;

        &:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        &.selected {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
      }

      .custom-input-container {
        position: relative;

        .modern-input {
          width: 100%;
          padding: 12px 16px;
          padding-right: 60px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: #f9fafb;

          &:focus {
            outline: none;
            border-color: #4f46e5;
            background: white;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          }

          &::placeholder {
            color: #9ca3af;
          }
        }

        .input-char-count {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: #9ca3af;
          font-weight: 500;
        }
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 24px;
        background: #f9fafb;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }

      .modern-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .selected-emoji {
          font-size: 16px;
        }

        &.secondary {
          background: #f3f4f6;
          color: #374151;

          &:hover {
            background: #e5e7eb;
          }
        }

        &.primary {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
        }
      }

      /* Animations */
      @keyframes backdropFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }

      @keyframes bounce {
        0%,
        20%,
        53%,
        80%,
        100% {
          transform: translateY(0);
        }
        40%,
        43% {
          transform: translateY(-10px);
        }
        70% {
          transform: translateY(-5px);
        }
        90% {
          transform: translateY(-2px);
        }
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* Responsive Design */
      @media (max-width: 480px) {
        .modern-cheer-modal {
          width: 95%;
          max-height: 90vh;
        }

        .modal-header {
          padding: 20px;

          .header-content {
            gap: 12px;

            .celebration-icon {
              font-size: 28px;
            }

            .header-text h4 {
              font-size: 16px;
            }
          }
        }

        .modal-body {
          padding: 20px;
        }

        .emoji-selection {
          grid-template-columns: repeat(5, 1fr);
        }

        .modal-footer {
          padding: 16px 20px;
          flex-direction: column;

          .modern-btn {
            width: 100%;
            justify-content: center;
          }
        }
      }
    `,
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class CheerButtonComponent implements OnInit {
  @Input() habit!: HabitWithProgressDTO;
  @Output() cheerSent = new EventEmitter<void>();

  showCheerModal = false;
  isSubmitting = false;
  selectedEmoji = '🎉';
  selectedMessage = '';
  customMessage = '';

  cheerEmojis = CHEER_EMOJIS;
  cheerMessages = CHEER_MESSAGES.slice(0, 6); // Show first 6 predefined messages
  currentUserId: string | null = null;
  constructor(
    private cheeringService: CheeringService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}
  ngOnInit(): void {
    // For now, we'll use the userName as the current user identifier
    // In a real implementation, the backend should provide user ID
    this.currentUserId = this.authService.getCurrentUser()?.userName || null;
    this.selectedMessage = this.cheeringService.getRandomCheerMessage();
  }
  get canShowCheerButton(): boolean {
    return (
      this.habit &&
      !this.habit.isOwnedHabit &&
      this.habit.isCompleted &&
      this.currentUserId !== null
    );
  }
  get canSendCheer(): boolean {
    return Boolean(
      this.selectedEmoji && (this.selectedMessage || this.customMessage.trim())
    );
  }

  get finalMessage(): string {
    return this.customMessage.trim() || this.selectedMessage;
  }

  toggleCheerModal(): void {
    this.showCheerModal = !this.showCheerModal;
    if (this.showCheerModal) {
      // Reset form when opening
      this.selectedEmoji = this.cheeringService.getRandomCheerEmoji();
      this.selectedMessage = this.cheeringService.getRandomCheerMessage();
      this.customMessage = '';
    }
  }

  closeCheerModal(): void {
    this.showCheerModal = false;
  }

  selectEmoji(emoji: string): void {
    this.selectedEmoji = emoji;
  }

  selectMessage(message: string): void {
    this.selectedMessage = message;
    this.customMessage = ''; // Clear custom message when selecting predefined
  }

  onCustomMessageChange(): void {
    if (this.customMessage.trim()) {
      this.selectedMessage = ''; // Clear predefined message when typing custom
    }
  }
  async sendCheer(): Promise<void> {
    if (!this.canSendCheer || this.isSubmitting) return;

    this.isSubmitting = true;

    const cheerRequest: CheerRequest = {
      habitId: this.habit.id!,
      toUserId: this.habit.userId || '',
      message: this.finalMessage,
      emoji: this.selectedEmoji,
    };
    try {
      await this.cheeringService.sendCheer(cheerRequest).toPromise();
      this.toastService.showSuccess(
        'Cheer Sent!',
        `Your encouragement was sent to ${this.habit.userName || 'friend'}! ${
          this.selectedEmoji
        }`
      );
      this.cheerSent.emit();
      this.closeCheerModal();
    } catch (error) {
      console.error('Error sending cheer:', error);
      this.toastService.showError(
        'Cheer Failed',
        'Failed to send cheer. Please try again.'
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  onDocumentClick(event: Event): void {
    // Close modal when clicking outside (handled by backdrop)
  }
}
