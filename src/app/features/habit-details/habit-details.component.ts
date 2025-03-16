import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HabitsService } from '../../services/habits.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

interface ChartDataPoint {
  day: string;
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-habit-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './habit-details.component.html',
  styleUrls: ['./habit-details.component.scss'],
})
export class HabitDetailsComponent implements OnInit {
  habit: HabitWithProgressDTO | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  chartData: ChartDataPoint[] = [];

  constructor(
    private habitsService: HabitsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const habitId = this.route.snapshot.paramMap.get('id');
    if (!habitId) {
      this.errorMessage = 'No habit ID provided';
      this.isLoading = false;
      return;
    }

    this.loadHabitDetails(habitId);
  }

  private loadHabitDetails(habitId: string): void {
    this.habitsService.getHabitById(habitId).subscribe({
      next: (habit) => {
        this.habit = habit;
        this.isLoading = false;
        this.updateChartData();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load habit details';
        this.isLoading = false;
        console.error('Error loading habit:', err);
      },
    });
  }

  private updateChartData(): void {
    // Generate last 7 days dates
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    // Generate random completion data for demonstration
    const values = Array.from({ length: 7 }, () => {
      if (this.habit?.goalType === 'numeric') {
        return Math.floor(Math.random() * (this.habit.targetValue || 10));
      } else {
        return Math.random() > 0.5 ? 1 : 0;
      }
    });

    // Calculate max value for percentage calculation
    const maxValue =
      this.habit?.goalType === 'numeric'
        ? this.habit.targetValue || Math.max(...values)
        : 1;

    // Format data for chart
    this.chartData = dates.map((day, index) => ({
      day,
      value: values[index],
      percentage: (values[index] / maxValue) * 100,
    }));
  }

  editHabit(): void {
    if (this.habit?.id) {
      this.router.navigate(['/edit-habit', this.habit.id]);
    }
  }

  deleteHabit(): void {
    if (!this.habit?.id) return;

    if (confirm('Are you sure you want to delete this habit?')) {
      this.habitsService.deleteHabit(this.habit.id).subscribe({
        next: () => {
          this.router.navigate(['/habits']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete habit';
          console.error('Error deleting habit:', err);
        },
      });
    }
  }

  archiveHabit(): void {
    if (!this.habit?.id) return;

    if (confirm('Are you sure you want to archive this habit?')) {
      this.habitsService.archiveHabit(this.habit.id).subscribe({
        next: () => {
          this.router.navigate(['/habits']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to archive habit';
          console.error('Error archiving habit:', err);
        },
      });
    }
  }
}
