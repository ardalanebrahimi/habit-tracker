import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../../services/habits.service';
import { CommonModule } from '@angular/common';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-archived-habits',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './archived-habits.component.html',
  styleUrls: ['./archived-habits.component.scss'],
})
export class ArchivedHabitsComponent implements OnInit {
  archivedHabits: HabitWithProgressDTO[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.fetchArchivedHabits();
  }

  private fetchArchivedHabits(): void {
    this.habitsService.getArchivedHabits().subscribe({
      next: (habits) => {
        this.archivedHabits = habits;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          'Failed to load archived habits. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  deleteArchivedHabit(habit: HabitWithProgressDTO): void {
    if (
      confirm(`Are you sure you want to permanently delete "${habit.name}"?`)
    ) {
      this.habitsService.deleteHabit(habit.id!).subscribe({
        next: () => {
          this.archivedHabits = this.archivedHabits.filter(
            (h) => h.id !== habit.id
          );
        },
        error: (err) => {
          console.error('Error deleting archived habit:', err);
        },
      });
    }
  }
}
