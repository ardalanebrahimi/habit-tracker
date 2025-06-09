import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitsService } from '../../services/habits.service';
import { CreateHabitDTO } from '../../models/create-habit-dto.model';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './habit-form.component.html',
  styleUrls: ['./habit-form.component.scss'],
})
export class HabitFormComponent implements OnInit {
  step = 1;
  isEditMode = false;
  habitId: string | null = null;
  pageTitle = 'Create a New Habit';
  habit: CreateHabitDTO = {
    name: '',
    description: '',
    frequency: 'daily',
    goalType: 'binary',
    targetType: 'ongoing',
    allowedGaps: 1,
    isPrivate: false,
  };

  minDate = new Date().toISOString().split('T')[0];
  isLoading = false;
  errorMessage: string | null = null;
  startType?: string;

  constructor(
    private habitsService: HabitsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    this.habitId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.habitId;
    this.pageTitle = this.isEditMode ? 'Edit Habit' : 'Create a New Habit';

    if (this.isEditMode && this.habitId) {
      this.loadHabitForEditing();
    }
  }

  private loadHabitForEditing(): void {
    this.isLoading = true;
    this.habitsService.getHabitById(this.habitId!).subscribe({
      next: (habit) => {
        if (habit) {
          // Map HabitWithProgressDTO to CreateHabitDTO format
          this.habit = {
            name: habit.name || '',
            description: habit.description || '',
            frequency: habit.frequency,
            goalType: habit.goalType,
            targetValue: habit.targetValue,
            targetType: habit.targetType || 'ongoing',
            streakTarget: habit.streakTarget,
            endDate: habit.endDate,
            allowedGaps: habit.allowedGaps || 1,
            startDate: habit.startDate,
            isPrivate: habit.isPrivate || false,
          };
        } else {
          this.errorMessage = 'Habit not found.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load habit details.';
        this.isLoading = false;
      },
    });
  }

  nextStep(): void {
    this.step++;
  }

  previousStep(): void {
    this.step--;
  }

  saveHabit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.habit.startDate) {
      this.habit.startDate = new Date(this.habit.startDate).toISOString();
    }
    if (this.habit.endDate) {
      this.habit.endDate = new Date(this.habit.endDate).toISOString();
    }

    const request = this.isEditMode
      ? this.habitsService.updateHabit(this.habitId!, this.habit)
      : this.habitsService.addHabit(this.habit);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/habits']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = `Failed to ${
          this.isEditMode ? 'update' : 'add'
        } habit. Please try again.`;
      },
    });
  }
}
