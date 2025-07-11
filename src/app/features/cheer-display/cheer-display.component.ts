import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CheeringService } from '../../services/cheering.service';
import { Cheer } from '../../models/cheer.model';

@Component({
  selector: 'app-cheer-display',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cheer-display.component.html',
  styleUrls: ['./cheer-display.component.scss'],
})
export class CheerDisplayComponent implements OnInit {
  @Input() habitId!: string;

  cheers: Cheer[] = [];
  showAll = false;
  isLoading = false;

  constructor(private cheeringService: CheeringService) {}

  ngOnInit(): void {
    this.loadCheers();
  }

  get displayedCheers(): Cheer[] {
    return this.showAll ? this.cheers : this.cheers.slice(0, 3);
  }

  loadCheers(): void {
    if (!this.habitId) return;

    this.isLoading = true;
    this.cheeringService.getCheersForHabit(this.habitId).subscribe({
      next: (cheers) => {
        this.cheers = cheers.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cheers:', error);
        this.isLoading = false;
      },
    });
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  trackByCheer(index: number, cheer: Cheer): string {
    return cheer.id;
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return timestamp.toLocaleDateString();
  }
}
