import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheerButtonComponent } from '../cheer-button/cheer-button.component';
import { CheerDisplayComponent } from '../cheer-display/cheer-display.component';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-cheer-test',
  standalone: true,
  imports: [CommonModule, CheerButtonComponent, CheerDisplayComponent],
  templateUrl: './cheer-test.component.html',
  styleUrls: ['./cheer-test.component.scss'],
})
export class CheerTestComponent {
  debugMode = false;

  // Mock data for testing
  mockFriendHabit: HabitWithProgressDTO = {
    id: 'test-friend-habit-1',
    name: 'Morning Exercise',
    description: 'Daily morning workout routine',
    frequency: 'daily',
    goalType: 'binary',
    streak: 15,
    isCompleted: true,
    isOwnedHabit: false,
    userName: 'TestFriend',
    targetType: 'ongoing',
    isPrivate: false,
  };

  mockOwnHabit: HabitWithProgressDTO = {
    id: 'test-own-habit-1',
    name: 'Read Books',
    description: 'Read for 30 minutes daily',
    frequency: 'daily',
    goalType: 'numeric',
    targetValue: 30,
    currentValue: 25,
    streak: 8,
    isCompleted: true,
    isOwnedHabit: true,
    userName: 'You',
    targetType: 'ongoing',
    isPrivate: false,
  };

  mockIncompleteHabit: HabitWithProgressDTO = {
    id: 'test-incomplete-habit-1',
    name: 'Meditation',
    description: 'Daily meditation practice',
    frequency: 'daily',
    goalType: 'binary',
    streak: 3,
    isCompleted: false,
    isOwnedHabit: false,
    userName: 'AnotherFriend',
    targetType: 'ongoing',
    isPrivate: false,
  };

  onCheerSent(type: string): void {
    alert(`Cheer sent for ${type} habit! 🎉`);
  }

  toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
  }
}
