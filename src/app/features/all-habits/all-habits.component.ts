import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../../services/habits.service';
import { CommonModule } from '@angular/common';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-habits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-habits.component.html',
  styleUrls: ['./all-habits.component.scss'],
})
export class AllHabitsComponent implements OnInit {
  allHabits: HabitWithProgressDTO[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private habitsService: HabitsService, private router: Router) {}

  ngOnInit(): void {
    this.fetchHabits();
  }

  private fetchHabits(): void {
    this.isLoading = true;
    this.habitsService.getActiveHabits().subscribe({
      next: (habits) => {
        this.allHabits = habits;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load habits. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  deleteHabit(habit: HabitWithProgressDTO): void {
    if (
      confirm(`Are you sure you want to permanently delete "${habit.name}"?`)
    ) {
      this.habitsService.deleteHabit(habit.id!).subscribe({
        next: () => {
          this.allHabits = this.allHabits.filter((h) => h.id !== habit.id);
        },
        error: (err) => {
          console.error('Error deleting habit:', err);
        },
      });
    }
  }

  archiveHabit(habit: HabitWithProgressDTO): void {
    if (
      confirm(
        `Are you sure you want to archive "${habit.name}"? This cannot be undone.`
      )
    ) {
      this.habitsService.archiveHabit(habit.id!).subscribe({
        next: () => {
          this.allHabits = this.allHabits.filter((h) => h.id !== habit.id);
        },
        error: (err) => {
          console.error('Error archiving habit:', err);
        },
      });
    }
  }

  goToArchived(): void {
    this.router.navigate(['/archived-habits']);
  }
}
