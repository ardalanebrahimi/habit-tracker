import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitsService } from '../../services/habits.service';
import { Habit } from '../../models/habit.model';

@Component({
  selector: 'app-add-habit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-habit.component.html',
  styleUrls: ['./add-habit.component.scss'],
})
export class AddHabitComponent {
  habitName = '';
  frequency: 'daily' | 'weekly' | 'monthly' = 'daily';
  goalType: 'binary' | 'numeric' = 'binary';
  targetValue?: number;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private habitsService: HabitsService, private router: Router) {}

  addHabit(): void {
    if (!this.habitName.trim()) {
      this.errorMessage = 'Habit name cannot be empty.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const newHabit: Habit = {
      id: undefined,
      name: this.habitName.trim(),
      frequency: this.frequency,
      goalType: this.goalType,
      targetValue: this.goalType === 'numeric' ? this.targetValue : undefined,
      currentValue: 0,
      streak: 0,
      logs: [],
      createdAt: new Date(),
    };

    this.habitsService.addHabit(newHabit).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/today']); // Navigate back to today's habits
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to add habit. Please try again.';
        console.error('Error adding habit:', err);
      },
    });
  }
}
