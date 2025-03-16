import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HabitsService } from '../../services/habits.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-habit-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './habit-details.component.html',
  styleUrls: ['./habit-details.component.scss'],
})
export class HabitDetailsComponent implements OnInit {
  habit: HabitWithProgressDTO | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private habitsService: HabitsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const habitId = this.route.snapshot.paramMap.get('id');
    if (!habitId) {
      this.errorMessage = 'No habit ID provided';
      this.isLoading = false;
      return;
    }

    this.loadHabitDetails(habitId);
  }

  private loadHabitDetails(habitId: string): void {
    this.habitsService.getHabitById(habitId).subscribe({
      next: (habit) => {
        this.habit = habit;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load habit details';
        this.isLoading = false;
        console.error('Error loading habit:', err);
      },
    });
  }

  editHabit(): void {
    if (this.habit?.id) {
      this.router.navigate(['/edit-habit', this.habit.id]);
    }
  }

  deleteHabit(): void {
    if (!this.habit?.id) return;

    if (confirm('Are you sure you want to delete this habit?')) {
      this.habitsService.deleteHabit(this.habit.id).subscribe({
        next: () => {
          this.router.navigate(['/habits']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete habit';
          console.error('Error deleting habit:', err);
        },
      });
    }
  }

  archiveHabit(): void {
    if (!this.habit?.id) return;

    if (confirm('Are you sure you want to archive this habit?')) {
      this.habitsService.archiveHabit(this.habit.id).subscribe({
        next: () => {
          this.router.navigate(['/habits']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to archive habit';
          console.error('Error archiving habit:', err);
        },
      });
    }
  }
}
