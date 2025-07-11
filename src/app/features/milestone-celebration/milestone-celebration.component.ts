import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharingService } from '../../services/sharing.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-milestone-celebration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './milestone-celebration.component.html',
  styleUrls: ['./milestone-celebration.component.scss'],
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
