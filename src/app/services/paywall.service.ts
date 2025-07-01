import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService, UserTokenInfo } from './user.service';
import { BillingService } from './billing.service';

export interface PaywallConfig {
  title: string;
  message: string;
  tokenCost: number;
  actionType: 'habit_creation' | 'ai_simple' | 'ai_advanced' | 'custom_cheer';
  showAlternatives: boolean;
  alternatives?: PaywallAlternative[];
}

export interface PaywallAlternative {
  title: string;
  description: string;
  action: () => void;
}

export interface PaywallResult {
  action: 'spend_tokens' | 'upgrade' | 'alternative' | 'cancel';
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class PaywallService {
  private showPaywall = new BehaviorSubject<PaywallConfig | null>(null);
  private paywallResult = new BehaviorSubject<PaywallResult | null>(null);

  constructor(
    private userService: UserService,
    private billingService: BillingService
  ) {}

  /**
   * Get paywall visibility state
   */
  getPaywallState(): Observable<PaywallConfig | null> {
    return this.showPaywall.asObservable();
  }

  /**
   * Get paywall result
   */
  getPaywallResult(): Observable<PaywallResult | null> {
    return this.paywallResult.asObservable();
  }

  /**
   * Check if user can perform action, show paywall if needed
   */
  async checkActionPermission(
    actionType: string,
    tokenCost: number = 1
  ): Promise<boolean> {
    const tokenInfo = await this.userService.getTokenInfo().toPromise();

    if (!tokenInfo) {
      this.showActionPaywall(
        'Unknown Action',
        'This action requires tokens.',
        tokenCost,
        'habit_creation'
      );
      return false;
    }

    // Check specific action permissions
    switch (actionType) {
      case 'habit_creation':
        if (!tokenInfo.canCreateHabits && tokenInfo.tokenBalance < tokenCost) {
          this.showHabitCreationPaywall();
          return false;
        }
        break;

      case 'ai_simple':
      case 'ai_advanced':
        if (tokenInfo.tokenBalance < tokenCost) {
          this.showAIPaywall(actionType, tokenCost);
          return false;
        }
        break;

      case 'custom_cheer':
        if (tokenInfo.tokenBalance < tokenCost) {
          this.showCheerPaywall();
          return false;
        }
        break;
    }

    return true;
  }

  /**
   * Show habit creation paywall
   */
  private showHabitCreationPaywall(): void {
    this.showPaywall.next({
      title: "You've reached your free habit limit",
      message:
        'Create unlimited habits with Premium or use 1 token to create this habit.',
      tokenCost: 1,
      actionType: 'habit_creation',
      showAlternatives: true,
      alternatives: [
        {
          title: 'Get Premium',
          description: 'Unlimited habits + monthly tokens',
          action: () => this.showUpgradeOptions(),
        },
      ],
    });
  }

  /**
   * Show AI feature paywall
   */
  private showAIPaywall(
    actionType: 'ai_simple' | 'ai_advanced',
    tokenCost: number
  ): void {
    const isAdvanced = actionType === 'ai_advanced';

    this.showPaywall.next({
      title: `${isAdvanced ? 'Advanced' : 'Simple'} AI Suggestion`,
      message: `This ${
        isAdvanced ? 'advanced' : 'simple'
      } AI feature costs ${tokenCost} token${tokenCost > 1 ? 's' : ''}.`,
      tokenCost,
      actionType,
      showAlternatives: !isAdvanced,
      alternatives: !isAdvanced
        ? [
            {
              title: 'Create Manually',
              description: 'Create your habit without AI assistance',
              action: () => this.selectAlternative(),
            },
          ]
        : undefined,
    });
  }

  /**
   * Show custom cheer paywall
   */
  private showCheerPaywall(): void {
    this.showPaywall.next({
      title: 'Custom Cheer Message',
      message:
        'Send a personalized cheer message for 1 token, or use a quick emoji reaction for free.',
      tokenCost: 1,
      actionType: 'custom_cheer',
      showAlternatives: true,
      alternatives: [
        {
          title: 'Quick Emoji',
          description: 'Send a free emoji reaction',
          action: () => this.selectAlternative(),
        },
      ],
    });
  }

  /**
   * Show generic action paywall
   */
  private showActionPaywall(
    title: string,
    message: string,
    tokenCost: number,
    actionType: any
  ): void {
    this.showPaywall.next({
      title,
      message,
      tokenCost,
      actionType,
      showAlternatives: false,
    });
  }

  /**
   * User chooses to spend tokens
   */
  spendTokens(): void {
    this.paywallResult.next({ action: 'spend_tokens' });
    this.hidePaywall();
  }

  /**
   * User chooses to upgrade
   */
  showUpgradeOptions(): void {
    this.paywallResult.next({ action: 'upgrade' });
    this.hidePaywall();
  }

  /**
   * User chooses alternative action
   */
  selectAlternative(): void {
    this.paywallResult.next({ action: 'alternative' });
    this.hidePaywall();
  }

  /**
   * User cancels
   */
  cancel(): void {
    this.paywallResult.next({ action: 'cancel' });
    this.hidePaywall();
  }

  /**
   * Hide paywall
   */
  hidePaywall(): void {
    this.showPaywall.next(null);
  }

  /**
   * Show token balance warning if low
   */
  checkAndShowLowTokenWarning(): boolean {
    // Check if user has low token balance and show subtle indicator
    // This will be implemented in components
    return false;
  }

  /**
   * Get habit creation limit status
   */
  async getHabitLimitStatus(): Promise<{
    canCreate: boolean;
    reason?: string;
  }> {
    try {
      const tokenInfo = await this.userService.getTokenInfo().toPromise();

      if (!tokenInfo) {
        return { canCreate: false, reason: 'Unable to check limits' };
      }

      if (tokenInfo.canCreateHabits) {
        return { canCreate: true };
      }

      if (tokenInfo.tokenBalance > 0) {
        return { canCreate: true };
      }

      return {
        canCreate: false,
        reason: `You've reached your ${tokenInfo.habitLimit} habit limit. Upgrade to Premium or earn tokens to create more habits.`,
      };
    } catch (error) {
      return { canCreate: false, reason: 'Error checking limits' };
    }
  }
}
