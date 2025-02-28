import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitsService } from '../../services/habits.service';
import { CreateHabitDTO } from '../../models/create-habit-dto.model';

@Component({
  selector: 'app-add-habit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-habit.component.html',
  styleUrls: ['./add-habit.component.scss'],
})
export class AddHabitComponent {
  step = 1;
  habit: CreateHabitDTO = {
    name: '',
    description: '',
    frequency: 'daily',
    goalType: 'binary',
    targetType: 'ongoing',
  };

  minDate = new Date().toISOString().split('T')[0];

  isLoading = false;
  errorMessage: string | null = null;

  constructor(private habitsService: HabitsService, private router: Router) {}

  nextStep(): void {
    this.step++;
  }

  previousStep(): void {
    this.step--;
  }

  addHabit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.habit.startDate) {
      this.habit.startDate = new Date(this.habit.startDate).toISOString();
    }
    if (this.habit.endDate) {
      this.habit.endDate = new Date(this.habit.endDate).toISOString();
    }

    this.habitsService.addHabit(this.habit).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/today']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to add habit. Please try again.';
      },
    });
  }
}
