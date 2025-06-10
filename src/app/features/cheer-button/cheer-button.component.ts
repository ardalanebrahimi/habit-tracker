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
      <!-- Cheer Button -->
      <button
        class="cheer-btn"
        (click)="toggleCheerModal()"
        [class.active]="showCheerModal"
        [disabled]="isSubmitting"
        title="Send encouragement"
      >
        🎉
      </button>

      <!-- Cheer Modal -->
      <div
        class="cheer-modal"
        *ngIf="showCheerModal"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h4>Cheer for {{ habit.userName }}!</h4>
          <button class="close-btn" (click)="closeCheerModal()">×</button>
        </div>

        <div class="modal-body">
          <div class="habit-info">
            <strong>{{ habit.name }}</strong>
            <span class="completion-badge" *ngIf="habit.isCompleted"
              >✅ Completed!</span
            >
          </div>

          <!-- Emoji Selection -->
          <div class="emoji-section">
            <label>Choose an emoji:</label>
            <div class="emoji-grid">
              <button
                *ngFor="let emojiItem of cheerEmojis"
                class="emoji-btn"
                [class.selected]="selectedEmoji === emojiItem.emoji"
                (click)="selectEmoji(emojiItem.emoji)"
                [title]="emojiItem.label"
              >
                {{ emojiItem.emoji }}
              </button>
            </div>
          </div>

          <!-- Message Selection -->
          <div class="message-section">
            <label>Add a message:</label>
            <div class="message-options">
              <button
                *ngFor="let msg of cheerMessages"
                class="message-btn"
                [class.selected]="selectedMessage === msg"
                (click)="selectMessage(msg)"
              >
                {{ msg }}
              </button>
            </div>
            <div class="custom-message">
              <input
                type="text"
                [(ngModel)]="customMessage"
                placeholder="Or write your own..."
                maxlength="100"
                (input)="onCustomMessageChange()"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn cancel-btn" (click)="closeCheerModal()">
            Cancel
          </button>
          <button
            class="btn send-btn"
            (click)="sendCheer()"
            [disabled]="!canSendCheer || isSubmitting"
          >
            {{ isSubmitting ? 'Sending...' : 'Send Cheer' }} {{ selectedEmoji }}
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      class="modal-backdrop"
      *ngIf="showCheerModal"
      (click)="closeCheerModal()"
    ></div>
  `,
  styles: [
    `
      .cheer-container {
        position: relative;
        display: inline-block;
      }

      .cheer-btn {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .cheer-btn:hover {
        background: #f0f7ff;
        transform: scale(1.1);
      }

      .cheer-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
      }

      .cheer-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        width: 90%;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #eee;
      }

      .modal-header h4 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        line-height: 1;
      }

      .close-btn:hover {
        color: #333;
      }

      .modal-body {
        padding: 20px;
      }

      .habit-info {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .completion-badge {
        background: #28a745;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
      }

      .emoji-section,
      .message-section {
        margin-bottom: 20px;
      }

      .emoji-section label,
      .message-section label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }

      .emoji-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
      }

      .emoji-btn {
        background: #f8f9fa;
        border: 2px solid transparent;
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s ease;
      }

      .emoji-btn:hover {
        background: #e9ecef;
        transform: scale(1.1);
      }

      .emoji-btn.selected {
        border-color: #007bff;
        background: #e3f2fd;
      }

      .message-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }

      .message-btn {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 16px;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .message-btn:hover {
        background: #e9ecef;
      }

      .message-btn.selected {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }

      .custom-message input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        font-size: 14px;
      }

      .custom-message input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid #eee;
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s ease;
      }

      .cancel-btn {
        background: #6c757d;
        color: white;
      }

      .cancel-btn:hover {
        background: #5a6268;
      }

      .send-btn {
        background: #28a745;
        color: white;
      }

      .send-btn:hover:not(:disabled) {
        background: #218838;
      }

      .send-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }

      @media (max-width: 480px) {
        .cheer-modal {
          width: 95%;
          margin: 10px;
        }

        .emoji-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .modal-footer {
          flex-direction: column;
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
      toUserId: this.habit.userName || '', // Using userName as user identifier for now
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
