import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../../services/habits.service';
import { CommonModule } from '@angular/common';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-all-habits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-habits.component.html',
  styleUrls: ['./all-habits.component.scss'],
})
export class AllHabitsComponent implements OnInit {
  allHabits: HabitWithProgressDTO[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.fetchHabits();
  }

  private fetchHabits(): void {
    this.habitsService.getAllHabits().subscribe({
      next: (habits) => {
        this.allHabits = habits;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load habits. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching habits:', err);
      },
    });
  }
}
