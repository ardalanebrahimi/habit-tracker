import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HabitsService } from '../../services/habits.service';
import { ConnectionsService } from '../../services/connections.service';
import {
  HabitWithProgressDTO,
  HabitLogDTO,
} from '../../models/habit-with-progress-dto.model';
import { HabitShareComponent } from '../habit-share/habit-share.component';
import { CheerButtonComponent } from '../cheer-button/cheer-button.component';
import { CheerDisplayComponent } from '../cheer-display/cheer-display.component';
import { HabitHeatMapComponent } from '../habit-heat-map/habit-heat-map.component';

interface ChartDataPoint {
  day: string;
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-habit-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HabitShareComponent,
    CheerButtonComponent,
    CheerDisplayComponent,
    HabitHeatMapComponent,
  ],
  templateUrl: './habit-details.component.html',
  styleUrls: ['./habit-details.component.scss'],
})
export class HabitDetailsComponent implements OnInit {
  habit: HabitWithProgressDTO | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  chartData: ChartDataPoint[] = [];
  heatMapLogs: HabitLogDTO[] = [];
  connections: any[] = [];
  showCheckRequestModal = false;
  selectedConnections: string[] = [];

  constructor(
    private habitsService: HabitsService,
    private connectionsService: ConnectionsService,
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
    this.loadConnections();
  }

  private loadHabitDetails(habitId: string): void {
    this.habitsService.getHabitById(habitId).subscribe({
      next: (habit) => {
        this.habit = habit;
        this.isLoading = false;
        this.updateChartData();
        this.loadHeatMapData(habitId);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load habit details';
        this.isLoading = false;
        console.error('Error loading habit:', err);
      },
    });
  }

  private loadConnections(): void {
    this.connectionsService.getConnections().subscribe({
      next: (connections) => {
        this.connections = connections;
      },
      error: (err) => {
        console.error('Error loading connections:', err);
      },
    });
  }

  private loadHeatMapData(habitId: string): void {
    // Load logs for the last 84 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 84);

    this.habitsService.getHabitLogs(habitId, startDate, endDate).subscribe({
      next: (logs) => {
        this.heatMapLogs = logs;
      },
      error: (err) => {
        console.error('Error loading heat map data:', err);
        // Don't show error to user for heat map - it's supplementary
        this.heatMapLogs = [];
      },
    });
  }

  toggleCheckRequestModal(): void {
    this.showCheckRequestModal = !this.showCheckRequestModal;
    if (this.showCheckRequestModal) {
      this.selectedConnections = [];
    }
  }

  toggleConnectionSelection(userId: string): void {
    const index = this.selectedConnections.indexOf(userId);
    if (index === -1) {
      this.selectedConnections.push(userId);
    } else {
      this.selectedConnections.splice(index, 1);
    }
  }

  sendCheckRequest(): void {
    if (!this.habit?.id || this.selectedConnections.length === 0) return;

    this.connectionsService
      .requestHabitCheck(this.habit.id, this.selectedConnections)
      .subscribe({
        next: () => {
          this.showCheckRequestModal = false;
          this.selectedConnections = [];
        },
        error: (err) => {
          this.errorMessage = 'Failed to send check request';
          console.error('Error sending check request:', err);
        },
      });
  }

  private updateChartData(): void {
    if (!this.habit) return;

    // Get the appropriate key based on habit frequency
    const getKey = (date: Date): number => {
      switch (this.habit?.frequency) {
        case 'daily':
          return parseInt(date.toISOString().slice(0, 10).replace(/-/g, ''));
        case 'weekly':
          const weekYear = date.getFullYear();
          const week = Math.ceil(
            (date.getTime() - new Date(weekYear, 0, 4).getTime()) /
              (7 * 24 * 60 * 60 * 1000)
          );
          return weekYear * 100 + week;
        case 'monthly':
          return date.getFullYear() * 100 + (date.getMonth() + 1);
        default:
          return 0;
      }
    };

    // Generate last 7 periods based on frequency
    const periods = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      switch (this.habit?.frequency) {
        case 'daily':
          date.setDate(date.getDate() - i);
          return {
            date,
            key: getKey(date),
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          };
        case 'weekly':
          date.setDate(date.getDate() - i * 7);
          return {
            date,
            key: getKey(date),
            label: `W${Math.ceil(
              (date.getTime() - new Date(date.getFullYear(), 0, 4).getTime()) /
                (7 * 24 * 60 * 60 * 1000)
            )}`,
          };
        case 'monthly':
        default:
          date.setMonth(date.getMonth() - i);
          return {
            date,
            key: getKey(date),
            label: date.toLocaleDateString('en-US', { month: 'short' }),
          };
      }
    }).reverse();

    // Map logs to chart data
    this.chartData = periods.map((period) => {
      const log = this.habit?.recentLogs?.find((log) => {
        switch (this.habit?.frequency) {
          case 'daily':
            return log.dailyKey === period.key;
          case 'weekly':
            return log.weeklyKey === period.key;
          case 'monthly':
          default:
            return log.monthlyKey === period.key;
        }
      });

      const value = log?.value || 0;
      const target =
        log?.target ||
        (this.habit?.goalType === 'binary' ? 1 : this.habit?.targetValue || 1);

      return {
        day: period.label,
        value: value,
        percentage: (value / target) * 100,
      };
    });
  }

  calculateCompletionRate(): number {
    if (!this.habit?.recentLogs || this.habit.recentLogs.length === 0) {
      return 0;
    }

    const last30Days = this.habit.recentLogs.slice(-30);
    const completedDays = last30Days.filter((log) => {
      if (this.habit?.goalType === 'binary') {
        return log.value >= 1;
      } else {
        return log.value >= (log.target || this.habit?.targetValue || 1);
      }
    }).length;

    return Math.round((completedDays / last30Days.length) * 100);
  }

  getDaysRemaining(): number {
    if (!this.habit?.endDate) return 0;

    const endDate = new Date(this.habit.endDate);
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return Math.max(0, daysDiff);
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

  copyHabit(): void {
    if (!this.habit?.id) return;

    this.habitsService.copyHabit(this.habit.id).subscribe({
      next: (newHabit) => {
        // Navigate to the edit page of the newly created habit
        this.router.navigate(['/edit-habit', newHabit.id]);
      },
      error: (err) => {
        this.errorMessage = 'Failed to copy habit';
        console.error('Error copying habit:', err);
      },
    });
  }

  onShareCompleted(shareType: string): void {
    console.log(`Shared ${shareType} for habit: ${this.habit?.name}`);
    // Optional: Show a toast notification or update UI
  }

  onCheerSent(): void {
    // Refresh habit details to show updated cheer count
    if (this.habit?.id) {
      this.loadHabitDetails(this.habit.id);
    }
  }
}
