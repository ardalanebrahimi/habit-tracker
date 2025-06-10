export interface Cheer {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  habitId: string;
  habitName: string;
  message: string;
  emoji: string;
  timestamp: Date;
}

export interface CheerRequest {
  habitId: string;
  toUserId: string;
  message: string;
  emoji: string;
}

export interface CheerSummary {
  habitId: string;
  habitName: string;
  totalCheers: number;
  recentCheers: Cheer[];
}

export const CHEER_EMOJIS = [
  { emoji: '👏', label: 'Clapping' },
  { emoji: '🎉', label: 'Celebration' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '🏆', label: 'Trophy' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '💯', label: 'Hundred' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '⚡', label: 'Lightning' },
] as const;

export const CHEER_MESSAGES = [
  'Great job!',
  'Keep it up!',
  "You're crushing it!",
  'Amazing progress!',
  'So proud of you!',
  "You've got this!",
  'Incredible work!',
  'Keep going strong!',
  "You're unstoppable!",
  'Fantastic effort!',
] as const;

export class CheerFactory {
  static createFromResponse(response: any): Cheer {
    return {
      id: response.id,
      fromUserId: response.fromUserId,
      fromUsername: response.fromUsername,
      toUserId: response.toUserId,
      toUsername: response.toUsername,
      habitId: response.habitId,
      habitName: response.habitName,
      message: response.message,
      emoji: response.emoji,
      timestamp: new Date(response.createdAt),
    };
  }
}
