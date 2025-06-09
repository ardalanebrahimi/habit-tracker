export interface Milestone {
  id: string;
  habitId: string;
  streakValue: number;
  milestoneName: string;
  achievedDate: string; // ISO date string
  frequency: 'daily' | 'weekly' | 'monthly';
  habitName: string;
}

export interface MilestoneDefinition {
  streakValue: number;
  name: string;
  description: string;
  emoji: string;
}

export interface MilestoneCheckResult {
  isNewMilestone: boolean;
  milestone?: MilestoneDefinition;
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    streakValue: 7,
    name: 'First Week',
    description: 'Completed for 7 consecutive periods!',
    emoji: '🌟',
  },
  {
    streakValue: 14,
    name: 'Two Weeks Strong',
    description: 'Maintained for 2 weeks straight!',
    emoji: '💪',
  },
  {
    streakValue: 30,
    name: 'Monthly Champion',
    description: 'One month of consistency!',
    emoji: '🏆',
  },
  {
    streakValue: 50,
    name: 'Halfway Hero',
    description: '50 periods of dedication!',
    emoji: '🔥',
  },
  {
    streakValue: 100,
    name: 'Century Club',
    description: 'Incredible 100-period milestone!',
    emoji: '💎',
  },
  {
    streakValue: 200,
    name: 'Double Century',
    description: '200 periods of excellence!',
    emoji: '👑',
  },
  {
    streakValue: 365,
    name: 'Year-Long Warrior',
    description: 'A full year of commitment!',
    emoji: '🎯',
  },
];
