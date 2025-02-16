export interface CreateHabitDTO {
  name?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goalType: 'binary' | 'numeric';
  targetValue?: number; // Numeric goal (e.g., liters of water)
}
