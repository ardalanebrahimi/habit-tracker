import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitCardComponent } from '../habit-card/habit-card.component';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { RouterModule } from '@angular/router';
import { HabitsService } from '../../services/habits.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, HabitCardComponent, RouterModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {
  everyoneHabits: HabitWithProgressDTO[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  currentPage = 1;

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.fetchEveryoneHabits();
  }

  fetchEveryoneHabits(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.habitsService.getPublicHabits(this.currentPage).subscribe({
      next: (response: HabitWithProgressDTO[]) => {
        this.everyoneHabits = [...this.everyoneHabits, ...response];
        this.isLoading = false;
        this.currentPage++;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load public habits. Please try again.';
        console.error('Error fetching public habits:', err);
        this.isLoading = false;
      },
    });
  }

  /**
   * Handle scroll events for infinite loading
   */
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 2) {
      this.fetchEveryoneHabits();
    }
  }
}
