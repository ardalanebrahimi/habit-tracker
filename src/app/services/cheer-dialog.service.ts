import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HabitWithProgressDTO } from '../models/habit-with-progress-dto.model';

export interface CheerDialogState {
  isOpen: boolean;
  habit: HabitWithProgressDTO | null;
}

@Injectable({
  providedIn: 'root',
})
export class CheerDialogService {
  private dialogStateSubject = new BehaviorSubject<CheerDialogState>({
    isOpen: false,
    habit: null,
  });

  public dialogState$ = this.dialogStateSubject.asObservable();
  private resolvePromise: ((result: { cheerSent?: boolean }) => void) | null =
    null;

  /**
   * Opens the cheer dialog for the specified habit
   * @param habit The habit to send cheer for
   * @returns Promise that resolves when cheer is sent or dialog is cancelled
   */
  openCheerDialog(
    habit: HabitWithProgressDTO
  ): Promise<{ cheerSent?: boolean }> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.dialogStateSubject.next({
        isOpen: true,
        habit: habit,
      });
    });
  }

  /**
   * Closes the currently open dialog
   */
  closeDialog(result: { cheerSent?: boolean } = {}): void {
    this.dialogStateSubject.next({
      isOpen: false,
      habit: null,
    });

    if (this.resolvePromise) {
      this.resolvePromise(result);
      this.resolvePromise = null;
    }
  }

  /**
   * Checks if a dialog is currently open
   */
  isDialogOpen(): boolean {
    return this.dialogStateSubject.value.isOpen;
  }

  /**
   * Gets the current dialog state
   */
  getCurrentState(): CheerDialogState {
    return this.dialogStateSubject.value;
  }
}
