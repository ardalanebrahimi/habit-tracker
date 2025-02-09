import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HabitsService } from '../../services/habits.service';
import { Habit } from '../habit.model';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private habitsService: HabitsService, private router: Router) {}

  addHabit(): void {
    const newHabit: Habit = {
      id: uuidv4(),
      name: this.habitName,
      frequency: this.frequency,
      goalType: this.goalType,
      targetValue: this.goalType === 'numeric' ? this.targetValue : undefined,
      currentValue: 0,
      streak: 0,
      logs: [],
      createdAt: new Date(),
    };
    this.habitsService.addHabit(newHabit);
    this.router.navigate(['/today']); // Navigate back to today's habits
  }
}
