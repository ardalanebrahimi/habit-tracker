import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitLogDTO } from '../../models/habit-with-progress-dto.model';

interface HeatMapDay {
  date: Date;
  value: number;
  percentage: number;
  intensity: number; // 0-4 for color intensity
  isToday: boolean;
  dateKey: string;
}

@Component({
  selector: 'app-habit-heat-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-heat-map.component.html',
  styleUrls: ['./habit-heat-map.component.scss']
})
export class HabitHeatMapComponent implements OnInit, OnChanges {
  @Input() habitLogs: HabitLogDTO[] = [];
  @Input() habitFrequency: string = 'daily';
  @Input() targetValue: number = 1;
  @Input() goalType: string = 'binary';

  heatMapData: HeatMapDay[] = [];
  weeks: HeatMapDay[][] = [];
  dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthLabels: string[] = [];

  ngOnInit() {
    this.generateHeatMapData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['habitLogs'] || changes['habitFrequency'] || changes['targetValue']) {
      this.generateHeatMapData();
    }
  }

  private generateHeatMapData() {
    const days: HeatMapDay[] = [];
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83); // 84 days total (including today)

    // Create a map of date keys to log values for quick lookup
    const logMap = new Map<string, number>();
    this.habitLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const dateKey = this.getDateKey(logDate);
      const currentValue = logMap.get(dateKey) || 0;
      logMap.set(dateKey, currentValue + log.value);
    });

    // Generate 84 days of data
    for (let i = 0; i < 84; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateKey = this.getDateKey(date);
      const value = logMap.get(dateKey) || 0;
      const percentage = this.calculatePercentage(value);
      const intensity = this.getIntensity(percentage);
      
      days.push({
        date: new Date(date),
        value,
        percentage,
        intensity,
        isToday: this.isSameDay(date, today),
        dateKey
      });
    }

    this.heatMapData = days;
    this.generateWeekData();
    this.generateMonthLabels();
  }

  private getDateKey(date: Date): string {
    if (this.habitFrequency === 'daily') {
      return date.toISOString().slice(0, 10).replace(/-/g, '');
    } else if (this.habitFrequency === 'weekly') {
      const year = date.getFullYear();
      const week = this.getWeekNumber(date);
      return `${year}${week.toString().padStart(2, '0')}`;
    } else if (this.habitFrequency === 'monthly') {
      return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private calculatePercentage(value: number): number {
    if (this.goalType === 'binary') {
      return value > 0 ? 100 : 0;
    }
    return Math.min((value / this.targetValue) * 100, 100);
  }

  private getIntensity(percentage: number): number {
    if (percentage === 0) return 0;
    if (percentage <= 25) return 1;
    if (percentage <= 50) return 2;
    if (percentage <= 75) return 3;
    return 4;
  }

  private generateWeekData() {
    this.weeks = [];
    
    // Group consecutive days into weeks (12 weeks for 84 days)
    for (let i = 0; i < this.heatMapData.length; i += 7) {
      const week = this.heatMapData.slice(i, Math.min(i + 7, this.heatMapData.length));
      this.weeks.push(week);
    }
  }

  private generateMonthLabels() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.monthLabels = [];
    
    const seenMonths = new Set<string>();
    this.heatMapData.forEach((day, index) => {
      if (index % 14 === 0) { // Show month label every 2 weeks
        const monthName = months[day.date.getMonth()];
        if (!seenMonths.has(monthName)) {
          this.monthLabels.push(monthName);
          seenMonths.add(monthName);
        } else {
          this.monthLabels.push('');
        }
      }
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  getTooltipText(day: HeatMapDay): string {
    const dateStr = day.date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
    
    if (this.goalType === 'binary') {
      return `${dateStr}: ${day.value > 0 ? 'Completed' : 'Not completed'}`;
    } else {
      return `${dateStr}: ${day.value} / ${this.targetValue} (${Math.round(day.percentage)}%)`;
    }
  }

  getDayPosition(weekIndex: number, dayIndex: number): { gridColumn: number, gridRow: number } {
    const totalWeeks = this.weeks.length;
    return {
      gridColumn: weekIndex + 1,
      gridRow: dayIndex + 2 // +2 to account for month labels row
    };
  }

  get completedDaysCount(): number {
    return this.heatMapData.filter(d => d.value > 0).length;
  }

  get consistencyPercentage(): number {
    return Math.round((this.completedDaysCount / 84) * 100);
  }
}
