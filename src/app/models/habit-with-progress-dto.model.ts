export interface HabitLogDTO {
  id: string;
  timestamp: string; // ISO date string
  value: number;
  target: number;
  dailyKey: number; // Format: YYYYMMDD
  weeklyKey: number; // Format: YYYYWW
  monthlyKey: number; // Format: YYYYMM
}

export interface HabitWithProgressDTO {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goalType: 'binary' | 'numeric';
  targetValue?: number; // Numeric goal (e.g., liters of water)
  currentValue?: number; // ✅ Progress for numeric habits
  streak: number; // ✅ Number of consecutive days the habit was completed
  isCompleted: boolean; // ✅ Whether the habit is completed for today
  recentLogs?: HabitLogDTO[];

  streakTarget?: number;
  targetType: 'ongoing' | 'streak' | 'endDate';
  endDate?: string;
  allowedGaps?: number;
  startDate?: string;

  isOwnedHabit: boolean;
  userName?: string; // Optional field for friend's habits
  userId?: string;
  isPrivate?: boolean; // ✅ Privacy setting for the habit
}
