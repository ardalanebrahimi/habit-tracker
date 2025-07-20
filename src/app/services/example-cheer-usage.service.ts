// Example of how to use the CheerDialogService from anywhere in the application

import { Injectable } from '@angular/core';
import { CheerDialogService } from './cheer-dialog.service';
import { HabitWithProgressDTO } from '../models/habit-with-progress-dto.model';

@Injectable({
  providedIn: 'root',
})
export class ExampleUsageService {
  constructor(private cheerDialogService: CheerDialogService) {}

  /**
   * Example method showing how to open cheer dialog programmatically
   */
  async openCheerForHabit(habit: HabitWithProgressDTO): Promise<void> {
    try {
      const result = await this.cheerDialogService.openCheerDialog(habit);

      if (result.cheerSent) {
        console.log('Cheer was sent successfully!');
        // Handle successful cheer - maybe refresh data, show toast, etc.
      } else {
        console.log('Cheer dialog was cancelled');
        // Handle cancellation if needed
      }
    } catch (error) {
      console.error('Error opening cheer dialog:', error);
    }
  }

  /**
   * Example of opening cheer dialog with additional logic
   */
  async showCheerWithConfirmation(habit: HabitWithProgressDTO): Promise<void> {
    // You can add any pre-checks or confirmations here
    if (!habit.isCompleted) {
      console.warn('Cannot cheer for incomplete habit');
      return;
    }

    const result = await this.cheerDialogService.openCheerDialog(habit);

    if (result.cheerSent) {
      // Handle post-cheer logic
      console.log(`Cheer sent for ${habit.name}!`);
    }
  }
}
