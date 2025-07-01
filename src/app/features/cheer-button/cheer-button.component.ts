import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheeringService } from '../../services/cheering.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';
import { PaywallService } from '../../services/paywall.service';
import { PaywallModalComponent } from '../../components/paywall-modal/paywall-modal.component';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import {
  CheerRequest,
  CHEER_EMOJIS,
  CHEER_MESSAGES,
} from '../../models/cheer.model';

@Component({
  selector: 'app-cheer-button',
  standalone: true,
  imports: [CommonModule, FormsModule, PaywallModalComponent],
  styleUrls: ['./cheer-button.component.scss'],
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
              <div class="input-footer">
                <div class="input-char-count">
                  {{ customMessage.length || 0 }}/100
                </div>
                <div
                  class="token-indicator"
                  *ngIf="customMessage.trim().length > 0"
                >
                  🪙 1 token
                </div>
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

    <!-- Paywall Modal -->
    <app-paywall-modal></app-paywall-modal>
  `,
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
    private toastService: ToastService,
    private userService: UserService,
    private paywallService: PaywallService
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

    // Check if custom message requires tokens
    const isCustomMessage = this.customMessage.trim().length > 0;
    if (isCustomMessage) {
      const canProceed = await this.paywallService.checkActionPermission(
        'custom_cheer',
        1
      );
      if (!canProceed) {
        return; // Paywall was shown
      }
    }

    this.isSubmitting = true;

    const cheerRequest: CheerRequest = {
      habitId: this.habit.id!,
      toUserId: this.habit.userId || '',
      message: this.finalMessage,
      emoji: this.selectedEmoji,
    };

    try {
      // Spend token for custom message
      if (isCustomMessage) {
        await this.userService
          .spendTokens({
            transactionType: 'custom_cheer',
            description: 'Custom cheer message',
            amount: 1,
          })
          .toPromise();
      }

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
