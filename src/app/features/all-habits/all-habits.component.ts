import { Component, OnInit } from '@angular/core';
import { HabitsService } from '../../services/habits.service';
import { Habit } from '../habit.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-habits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-habits.component.html',
  styleUrls: ['./all-habits.component.scss'],
})
export class AllHabitsComponent implements OnInit {
  allHabits: Habit[] = [];

  constructor(private habitsService: HabitsService) {}

  ngOnInit(): void {
    this.allHabits = this.habitsService.getHabits();
  }
}
