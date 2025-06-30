import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
  private readonly ONBOARDING_DISMISSED_KEY = 'onboarding_dismissed';

  constructor() {}

  /**
   * Check if user has completed onboarding
   */
  hasCompletedOnboarding(): boolean {
    return localStorage.getItem(this.ONBOARDING_COMPLETED_KEY) === 'true';
  }

  /**
   * Mark onboarding as completed
   */
  markOnboardingCompleted(): void {
    localStorage.setItem(this.ONBOARDING_COMPLETED_KEY, 'true');
    localStorage.removeItem(this.ONBOARDING_DISMISSED_KEY); // Clear any dismissal
  }

  /**
   * Check if user has dismissed onboarding prompts
   */
  hasUserDismissedOnboarding(): boolean {
    return localStorage.getItem(this.ONBOARDING_DISMISSED_KEY) === 'true';
  }

  /**
   * Mark onboarding prompts as dismissed
   */
  dismissOnboardingPrompts(): void {
    localStorage.setItem(this.ONBOARDING_DISMISSED_KEY, 'true');
  }

  /**
   * Reset onboarding state (useful for testing or when user wants to redo)
   */
  resetOnboardingState(): void {
    localStorage.removeItem(this.ONBOARDING_COMPLETED_KEY);
    localStorage.removeItem(this.ONBOARDING_DISMISSED_KEY);
  }

  /**
   * Check if we should show onboarding prompts
   */
  shouldShowOnboardingPrompts(): boolean {
    return !this.hasCompletedOnboarding() && !this.hasUserDismissedOnboarding();
  }
}
