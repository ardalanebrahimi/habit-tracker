import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheerDialogService } from '../../services/cheer-dialog.service';
import { HabitWithProgressDTO } from '../../models/habit-with-progress-dto.model';

@Component({
  selector: 'app-test-cheer-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h3>Test Cheer Dialog</h3>
      <button class="btn primary" (click)="testDialog()" [disabled]="isLoading">
        {{ isLoading ? 'Opening...' : 'Test Cheer Dialog' }}
      </button>
      <p *ngIf="lastResult">Last result: {{ lastResult | json }}</p>
    </div>
  `,
  styles: [
    `
      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      }
      .primary {
        background: #4f46e5;
        color: white;
      }
      .primary:hover:not(:disabled) {
        background: #4338ca;
      }
      .primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class TestCheerDialogComponent {
  isLoading = false;
  lastResult: any = null;

  constructor(private cheerDialogService: CheerDialogService) {}

  async testDialog(): Promise<void> {
    this.isLoading = true;

    // Create a mock habit
    const mockHabit: HabitWithProgressDTO = {
      id: 'test-habit-id',
      name: 'Test Habit',
      userName: 'Test User',
      userId: 'test-user-id',
      isCompleted: true,
      isOwnedHabit: false,
      description: 'Test habit description',
      frequency: 'daily',
      goalType: 'binary',
      streak: 5,
      targetType: 'ongoing',
    };

    try {
      const result = await this.cheerDialogService.openCheerDialog(mockHabit);
      this.lastResult = result;
      console.log('Dialog result:', result);
    } catch (error) {
      console.error('Error testing dialog:', error);
      this.lastResult = { error: String(error) };
    } finally {
      this.isLoading = false;
    }
  }
}
