import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheerButtonComponent } from '../cheer-button/cheer-button.component';
import { CheerDisplayComponent } from '../cheer-display/cheer-display.component';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-cheer-test',
  standalone: true,
  imports: [CommonModule, CheerButtonComponent, CheerDisplayComponent],
  template: `
    <div class="cheer-test-container">
      <h2>🎉 Cheer System Test</h2>

      <div class="test-section">
        <h3>Test Scenario 1: Friend's Completed Habit</h3>
        <p>This should show a cheer button:</p>
        <div class="habit-card-mock">
          <p>
            <strong>{{ mockFriendHabit.name }}</strong> by
            {{ mockFriendHabit.userName }}
          </p>
          <p>
            Status: ✅
            {{ mockFriendHabit.isCompleted ? 'Completed' : 'Not Completed' }}
          </p>
          <p>Is Own Habit: {{ mockFriendHabit.isOwnedHabit ? 'Yes' : 'No' }}</p>

          <app-cheer-button
            [habit]="mockFriendHabit"
            (cheerSent)="onCheerSent('friend')"
          ></app-cheer-button>
        </div>
      </div>

      <div class="test-section">
        <h3>Test Scenario 2: Your Own Habit</h3>
        <p>This should show cheer display (no cheer button):</p>
        <div class="habit-card-mock">
          <p>
            <strong>{{ mockOwnHabit.name }}</strong>
          </p>
          <p>
            Status: ✅
            {{ mockOwnHabit.isCompleted ? 'Completed' : 'Not Completed' }}
          </p>
          <p>Is Own Habit: {{ mockOwnHabit.isOwnedHabit ? 'Yes' : 'No' }}</p>

          <app-cheer-button
            [habit]="mockOwnHabit"
            (cheerSent)="onCheerSent('own')"
          ></app-cheer-button>

          <app-cheer-display [habitId]="mockOwnHabit.id"></app-cheer-display>
        </div>
      </div>

      <div class="test-section">
        <h3>Test Scenario 3: Friend's Incomplete Habit</h3>
        <p>This should NOT show a cheer button:</p>
        <div class="habit-card-mock">
          <p>
            <strong>{{ mockIncompleteHabit.name }}</strong> by
            {{ mockIncompleteHabit.userName }}
          </p>
          <p>
            Status: ❌
            {{
              mockIncompleteHabit.isCompleted ? 'Completed' : 'Not Completed'
            }}
          </p>
          <p>
            Is Own Habit: {{ mockIncompleteHabit.isOwnedHabit ? 'Yes' : 'No' }}
          </p>

          <app-cheer-button
            [habit]="mockIncompleteHabit"
            (cheerSent)="onCheerSent('incomplete')"
          ></app-cheer-button>
        </div>
      </div>

      <div class="debug-info">
        <h3>Debug Information</h3>
        <p>
          Check the browser console for detailed cheer button visibility logs.
        </p>
        <button (click)="toggleDebugMode()">
          {{ debugMode ? 'Disable' : 'Enable' }} Debug Mode
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .cheer-test-container {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
      }

      .test-section {
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
      }

      .habit-card-mock {
        background: white;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #eee;
        margin-top: 10px;
      }

      .debug-info {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
      }

      button {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }

      button:hover {
        background: #0056b3;
      }

      h2 {
        color: #333;
        margin-bottom: 20px;
      }

      h3 {
        color: #555;
        margin-bottom: 10px;
      }
    `,
  ],
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
    console.log(`Cheer sent for ${type} habit!`);
    alert(`Cheer sent for ${type} habit! 🎉`);
  }

  toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
    console.log(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
  }
}
