import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheeringService } from '../../services/cheering.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';
import { PaywallService } from '../../services/paywall.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import {
  CheerRequest,
  CHEER_EMOJIS,
  CHEER_MESSAGES,
} from '../../models/cheer.model';

@Component({
  selector: 'app-cheer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cheer-dialog.component.html',
  styleUrls: ['./cheer-dialog.component.scss'],
})
export class CheerDialogComponent implements OnInit {
  @Input() habit!: HabitWithProgressDTO;
  @Input() isVisible = false;
  @Output() dialogClosed = new EventEmitter<{ cheerSent?: boolean }>();

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
    this.currentUserId = this.authService.getCurrentUser()?.userName || null;
    this.selectedEmoji = this.cheeringService.getRandomCheerEmoji();
    this.selectedMessage = this.cheeringService.getRandomCheerMessage();
    this.customMessage = '';
  }

  get canSendCheer(): boolean {
    return Boolean(
      this.selectedEmoji && (this.selectedMessage || this.customMessage.trim())
    );
  }

  get finalMessage(): string {
    return this.customMessage.trim() || this.selectedMessage;
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

  onCancel(): void {
    this.dialogClosed.emit({});
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
      this.dialogClosed.emit({ cheerSent: true });
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
}
