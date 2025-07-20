import { Injectable } from '@angular/core';
import { DialogService } from './dialog.service';
import {
  CheerDialogContentComponent,
  CheerDialogData,
} from '../components/cheer-dialog-content/cheer-dialog-content.component';
import {
  SharingDialogContentComponent,
  SharingDialogData,
} from '../components/sharing-dialog-content/sharing-dialog-content.component';
import { HabitWithProgressDTO } from '../models/habit-with-progress-dto.model';

@Injectable({
  providedIn: 'root',
})
export class AppDialogService {
  constructor(private dialogService: DialogService) {}

  /**
   * Opens the cheer dialog for the specified habit
   * @param habit The habit to send cheer for
   * @returns Promise that resolves when cheer is sent or dialog is cancelled
   */
  async openCheerDialog(
    habit: HabitWithProgressDTO
  ): Promise<{ cheerSent?: boolean }> {
    const result = await this.dialogService.openDialog(
      CheerDialogContentComponent,
      {
        title: `Cheer for ${habit.userName}! 🎉`,
        data: { habit } as CheerDialogData,
        size: 'medium',
        closeOnBackdrop: true,
      }
    );

    return {
      cheerSent: result.action === 'confirm' && result.data?.cheerSent === true,
    };
  }

  /**
   * Opens the sharing dialog for the specified habit
   * @param habit The habit to share
   * @returns Promise that resolves when content is shared or dialog is cancelled
   */
  async openSharingDialog(
    habit: HabitWithProgressDTO
  ): Promise<{ shared?: boolean }> {
    const result = await this.dialogService.openDialog(
      SharingDialogContentComponent,
      {
        title: 'Share Your Progress 🚀',
        data: { habit } as SharingDialogData,
        size: 'medium',
        closeOnBackdrop: true,
      }
    );

    return {
      shared: result.action === 'confirm' && result.data?.shared === true,
    };
  }

  /**
   * Opens a simple confirmation dialog
   * @param title Dialog title
   * @param message Confirmation message
   * @param confirmText Text for confirm button
   * @param cancelText Text for cancel button
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  async confirm(
    title: string,
    message: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ): Promise<boolean> {
    return this.dialogService
      .confirm(title, message, confirmText, cancelText)
      .then((result) => result.action === 'confirm' && result.data === true);
  }

  /**
   * Checks if any dialog is currently open
   */
  isDialogOpen(): boolean {
    return this.dialogService.isDialogOpen();
  }

  /**
   * Closes the currently open dialog
   */
  closeDialog(): void {
    this.dialogService.closeDialog();
  }
}
