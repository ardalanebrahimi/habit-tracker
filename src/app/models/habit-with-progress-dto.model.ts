export interface HabitWithProgressDTO {
  id?: string;
  name?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goalType: 'binary' | 'numeric';
  targetValue?: number; // Numeric goal (e.g., liters of water)
  currentValue?: number; // ✅ Progress for numeric habits
  streak?: number; // ✅ Number of consecutive days the habit was completed
  isCompleted?: boolean; // ✅ Whether the habit is completed for today
}
