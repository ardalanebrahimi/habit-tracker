import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../../services/habits.service';
import { CommonModule } from '@angular/common';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  totalHabits: number = 0;
  completedToday: number = 0;
  completionRate: number = 0;
  bestStreak: number = 0;
  averageStreak: number = 0;
  dailyHabits: number = 0;
  weeklyHabits: number = 0;
  monthlyHabits: number = 0;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.fetchHabits();
  }

  private fetchHabits(): void {
    this.isLoading = true;
    this.habitsService.getAllHabits().subscribe({
      next: (habits: HabitWithProgressDTO[]) => {
        this.calculateStats(habits);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load statistics. Please try again.';
        console.error('Error fetching statistics:', err);
        this.isLoading = false;
      },
    });
  }

  private calculateStats(habits: HabitWithProgressDTO[]): void {
    // Overall stats
    this.totalHabits = habits.length;

    // Today's progress
    this.completedToday = habits.filter((h) => h.isCompleted).length;
    this.completionRate =
      this.totalHabits > 0
        ? Math.round((this.completedToday / this.totalHabits) * 100)
        : 0;

    // Streak stats
    this.bestStreak = Math.max(...habits.map((h) => h.streak));
    this.averageStreak =
      habits.length > 0
        ? habits.reduce((sum, h) => sum + h.streak, 0) / habits.length
        : 0;

    // Habit types
    this.dailyHabits = habits.filter((h) => h.frequency === 'daily').length;
    this.weeklyHabits = habits.filter((h) => h.frequency === 'weekly').length;
    this.monthlyHabits = habits.filter((h) => h.frequency === 'monthly').length;
  }
}
