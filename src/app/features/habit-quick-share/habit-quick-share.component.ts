import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDialogService } from '../../services/app-dialog.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-habit-quick-share',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-quick-share.component.html',
  styleUrls: ['./habit-quick-share.component.scss'],
})
export class HabitQuickShareComponent {
  @Input() habit!: HabitWithProgressDTO;

  isSharing = false;

  constructor(private appDialogService: AppDialogService) {}

  async openSharingDialog(): Promise<void> {
    if (this.isSharing) return;

    this.isSharing = true;
    try {
      const result = await this.appDialogService.openSharingDialog(this.habit);
      if (result.shared) {
        // Optional: Add any success handling here
        console.log('Content shared successfully!');
      }
    } catch (error) {
      console.error('Error opening sharing dialog:', error);
    } finally {
      this.isSharing = false;
    }
  }
}
