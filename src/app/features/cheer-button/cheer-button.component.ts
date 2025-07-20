import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AppDialogService } from '../../services/app-dialog.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-cheer-button',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./cheer-button.component.scss'],
  templateUrl: './cheer-button.component.html',
})
export class CheerButtonComponent implements OnInit {
  @Input() habit!: HabitWithProgressDTO;
  @Output() cheerSent = new EventEmitter<void>();

  isSubmitting = false;
  currentUserId: string | null = null;

  constructor(
    private authService: AuthService,
    private appDialogService: AppDialogService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.userName || null;
  }

  get canShowCheerButton(): boolean {
    return (
      this.habit &&
      !this.habit.isOwnedHabit &&
      this.habit.isCompleted &&
      this.currentUserId !== null
    );
  }

  async openCheerDialog(): Promise<void> {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const result = await this.appDialogService.openCheerDialog(this.habit);
      if (result.cheerSent) {
        this.cheerSent.emit();
      }
    } catch (error) {
      console.error('Error opening cheer dialog:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
