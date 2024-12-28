import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../habits.service';
import { Habit } from '../habit.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss'],
})
export class TodayComponent implements OnInit {
  todayHabits: Habit[] = [];

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.todayHabits = this.habitsService.getTodayHabits();
  }

  markHabitComplete(habit: Habit): void {
    habit.logs.push({ date: new Date().toISOString(), value: 1 });
    habit.streak++;
    this.habitsService.updateHabit(habit);
  }

  updateNumericProgress(habit: Habit, progress: number): void {
    habit.currentValue = (habit.currentValue || 0) + progress;
    if (habit.currentValue >= (habit.targetValue || 0)) {
      habit.logs.push({
        date: new Date().toISOString(),
        value: habit.currentValue,
      });
      habit.streak++;
    }
    this.habitsService.updateHabit(habit);
  }
}
