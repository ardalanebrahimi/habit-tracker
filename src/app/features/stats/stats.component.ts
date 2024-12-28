import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../habits.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  totalHabits: number = 0;
  completedHabits: number = 0;
  averageStreak: number = 0;

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    const habits = this.habitsService.getHabits();
    this.totalHabits = habits.length;
    this.completedHabits = habits.filter(
      (habit) => habit.logs.length > 0
    ).length;
    this.averageStreak =
      habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length || 0;
  }
}
