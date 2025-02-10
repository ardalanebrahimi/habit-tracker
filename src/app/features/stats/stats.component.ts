import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../../services/habits.service';
import { CommonModule } from '@angular/common';
import { Habit } from '../../models/habit.model';

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
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.fetchHabits();
  }

  private fetchHabits(): void {
    this.habitsService.getHabits().subscribe({
      next: (habits: Habit[]) => {
        this.totalHabits = habits.length;
        this.completedHabits = habits.filter(
          (habit) => habit.logs.length > 0
        ).length;
        this.averageStreak = habits.length
          ? habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length
          : 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load statistics. Please try again.';
        console.error('Error fetching statistics:', err);
        this.isLoading = false;
      },
    });
  }
}
