export interface OnboardingRequest {
  primaryGoal: string;
  currentStruggle: string;
  motivationLevel: string;
  availableTime: string;
  preferredSchedule: string;
}

export interface OnboardingResponse {
  suggestions: OnboardingSuggestion[];
  message?: string;
}

export interface OnboardingSuggestion {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goalType: 'binary' | 'numeric';
  targetType: 'ongoing' | 'streak' | 'endDate';
  targetValue?: number;
  streakTarget?: number;
  endDate?: string;
  allowedGaps?: number;
  category?: string;
  tips?: string;
  isPrivate?: boolean;
}

export interface OnboardingQuestion {
  id: keyof OnboardingRequest;
  title: string;
  subtitle: string;
  icon: string;
  options: OnboardingOption[];
  allowCustom?: boolean;
}

export interface OnboardingOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}
