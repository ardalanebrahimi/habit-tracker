// Test AI Habit Suggestion Feature
// This is a simple test to verify the implementation

import { CreateHabitDTO } from './models/create-habit-dto.model';

// Mock AI response (as it would come from the backend)
const mockAiResponse: CreateHabitDTO = {
  name: 'Daily 20-Minute Walk',
  description:
    'Take a brisk 20-minute walk every day to improve cardiovascular health and boost energy levels',
  frequency: 'daily',
  goalType: 'binary',
  targetType: 'ongoing',
  targetValue: 1,
  streakTarget: 7,
  endDate: undefined,
  allowedGaps: 1,
  startDate: undefined,
  isPrivate: false,
};

// Test that AI response can be used directly as CreateHabitDTO
function testDirectUsage() {
  const { ...habitData } = mockAiResponse;

  // This should work without any type errors
  const createHabitRequest: CreateHabitDTO = habitData;
}

// Test display formatting
function testDisplayFormatting() {
  const formatFrequency = (frequency: string): string => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const formatGoalType = (goalType: string): string => {
    return goalType === 'binary'
      ? 'Yes/No (Binary)'
      : 'Count/Measure (Numeric)';
  };
}

// Run tests
testDirectUsage();
testDisplayFormatting();

export { mockAiResponse };
