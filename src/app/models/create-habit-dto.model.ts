export interface CreateHabitDTO {
  name?: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goalType: 'binary' | 'numeric';
  targetValue?: number;
  streakTarget?: number;
  targetType: 'ongoing' | 'streak' | 'endDate';
  endDate?: string;
  allowedGaps?: number;
  startDate?: string;
}
