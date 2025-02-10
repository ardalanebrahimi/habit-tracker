export interface Habit {
  id?: string;
  name?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goalType: 'binary' | 'numeric';
  targetValue?: number; // Numeric goal (e.g., liters of water)
  currentValue?: number; // Progress for numeric habits
  reminderTime?: string; // Reminder time (e.g., "08:00")
  streak: number;
  logs: { date: string; value: number }[]; // Logs with date and progress
  createdAt: Date;
}
