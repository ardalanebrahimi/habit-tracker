import { HabitWithProgressDTO } from './habit-with-progress-dto.model';

export interface UserProfile {
  id: string;
  userName: string;
  email?: string;
  joinedDate: string;
  isFriend: boolean;
  isCurrentUser: boolean;
  analytics?: ProfileAnalytics;
  publicHabits: HabitWithProgressDTO[];
  friendHabits: HabitWithProgressDTO[];
}

export interface ProfileAnalytics {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  longestStreak: number;
  successRate: number;
  topCategories: string[];
}
