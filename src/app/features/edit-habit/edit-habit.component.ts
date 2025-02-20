import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitsService } from '../../services/habits.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-edit-habit',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-habit.component.html',
  styleUrls: ['./edit-habit.component.scss'],
})
export class EditHabitComponent implements OnInit {
  habitId: string | null = null;
  habit: HabitWithProgressDTO | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private habitsService: HabitsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.habitId = this.route.snapshot.paramMap.get('id');
    if (this.habitId) {
      this.habitsService.getAllHabits().subscribe({
        next: (habits) => {
          this.habit = habits.find((h) => h.id === this.habitId) ?? null;
          if (!this.habit) {
            this.errorMessage = 'Habit not found.';
          }
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load habit details.';
          this.isLoading = false;
        },
      });
    } else {
      this.errorMessage = 'Invalid habit ID.';
      this.isLoading = false;
    }
  }

  updateHabit(): void {
    if (!this.habit) return;

    this.isLoading = true;
    this.habitsService.updateHabit(this.habitId!, this.habit).subscribe({
      next: () => {
        this.router.navigate(['/habits']); // Redirect to all habits
      },
      error: () => {
        this.errorMessage = 'Failed to update habit.';
        this.isLoading = false;
      },
    });
  }
}
