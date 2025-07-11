// Simple test file to verify milestone functionality
import { MilestoneService } from './services/milestone.service';
import { HabitWithProgressDTO } from './models/habit-with-progress-dto.model';

// Test milestone checking logic
const milestoneService = new MilestoneService();

// Mock habit data
const testHabit: HabitWithProgressDTO = {
  id: 'test-1',
  name: 'Test Habit',
  frequency: 'daily' as const,
  goalType: 'binary' as const,
  streak: 7,
  isCompleted: true,
  isOwnedHabit: true,
  targetType: 'ongoing' as const,
};

// Test 7-day milestone
const result7 = milestoneService.checkForNewMilestone(testHabit, 6);

// Test 30-day milestone
testHabit.streak = 30;
const result30 = milestoneService.checkForNewMilestone(testHabit, 29);

// Test no milestone
testHabit.streak = 15;
const resultNone = milestoneService.checkForNewMilestone(testHabit, 14);
