import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheeringService } from '../../services/cheering.service';
import { Cheer } from '../../models/cheer.model';

@Component({
  selector: 'app-cheer-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cheer-display" *ngIf="cheers.length > 0">
      <div class="cheer-header">
        <span class="cheer-icon">🎉</span>
        <span class="cheer-count"
          >{{ cheers.length }} cheer{{ cheers.length !== 1 ? 's' : '' }}</span
        >
      </div>

      <div class="cheer-list" [class.expanded]="showAll">
        <div
          *ngFor="let cheer of displayedCheers; trackBy: trackByCheer"
          class="cheer-item"
        >
          <div class="cheer-content">
            <span class="cheer-emoji">{{ cheer.emoji }}</span>
            <div class="cheer-details">
              <div class="cheer-message">{{ cheer.message }}</div>
              <div class="cheer-meta">
                <span class="cheer-from">from {{ cheer.fromUsername }}</span>
                <span class="cheer-time">{{
                  getTimeAgo(cheer.timestamp)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        *ngIf="cheers.length > 3"
        class="show-more-btn"
        (click)="toggleShowAll()"
      >
        {{ showAll ? 'Show less' : 'Show all (' + cheers.length + ')' }}
      </button>
    </div>
  `,
  styles: [
    `
      .cheer-display {
        background: linear-gradient(135deg, #fff3cd 0%, #fef9e7 100%);
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
      }

      .cheer-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-weight: 500;
        color: #856404;
      }

      .cheer-icon {
        font-size: 16px;
      }

      .cheer-count {
        font-size: 14px;
      }

      .cheer-list {
        max-height: 120px;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .cheer-list.expanded {
        max-height: none;
      }

      .cheer-item {
        margin-bottom: 8px;
      }

      .cheer-item:last-child {
        margin-bottom: 0;
      }

      .cheer-content {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 6px;
        padding: 8px;
      }

      .cheer-emoji {
        font-size: 18px;
        line-height: 1;
      }

      .cheer-details {
        flex: 1;
        min-width: 0;
      }

      .cheer-message {
        font-weight: 500;
        color: #333;
        margin-bottom: 2px;
        word-wrap: break-word;
      }

      .cheer-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #666;
      }

      .cheer-from {
        font-weight: 500;
      }

      .cheer-time {
        opacity: 0.8;
      }

      .show-more-btn {
        background: none;
        border: none;
        color: #007bff;
        cursor: pointer;
        font-size: 12px;
        padding: 4px 0;
        margin-top: 8px;
        text-decoration: underline;
        width: 100%;
        text-align: center;
      }

      .show-more-btn:hover {
        color: #0056b3;
      }

      @media (max-width: 480px) {
        .cheer-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }
      }
    `,
  ],
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
