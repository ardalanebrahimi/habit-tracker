import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  UserService,
  SubscriptionStatus,
  TokenTransaction,
} from '../../services/user.service';
import {
  BillingService,
  SubscriptionPlan,
} from '../../services/billing.service';
import { TokenBalanceComponent } from '../../components/token-balance/token-balance.component';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, RouterModule, TokenBalanceComponent],
  templateUrl: 'subscription-management.component.html',
  styleUrls: ['subscription-management.component.scss'],
})
export class SubscriptionManagementComponent implements OnInit {
  subscriptionStatus: SubscriptionStatus | null = null;
  subscriptionPlans: SubscriptionPlan[] = [];
  tokenHistory: TokenTransaction[] = [];
  referralCode: string = '';

  constructor(
    private userService: UserService,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionStatus();
    this.loadSubscriptionPlans();
    this.loadTokenHistory();
    this.loadReferralCode();
    this.userService.initializeUserData();
  }

  private loadSubscriptionStatus(): void {
    this.userService.getSubscriptionStatus().subscribe({
      next: (status) => {
        this.subscriptionStatus = status;
      },
      error: (error) => {
        console.error('Error loading subscription status:', error);
      },
    });
  }

  private loadSubscriptionPlans(): void {
    this.billingService.getSubscriptionPlans().subscribe({
      next: (plans) => {
        this.subscriptionPlans = plans;
      },
      error: (error) => {
        console.error('Error loading subscription plans:', error);
      },
    });
  }

  private loadTokenHistory(): void {
    this.userService.getTokenHistory().subscribe({
      next: (history) => {
        this.tokenHistory = history;
      },
      error: (error) => {
        console.error('Error loading token history:', error);
      },
    });
  }

  private loadReferralCode(): void {
    this.userService.getReferralCode().subscribe({
      next: (response) => {
        this.referralCode = response.referralCode;
      },
      error: (error) => {
        console.error('Error loading referral code:', error);
      },
    });
  }

  getDisplayName(tier: string): string {
    switch (tier) {
      case 'premium_monthly':
        return 'Premium Monthly';
      case 'premium_yearly':
        return 'Premium Yearly';
      default:
        return 'Free Plan';
    }
  }

  getTokenPacks() {
    const tokenPacks = this.billingService.getTokenPackInfo();
    return Object.entries(tokenPacks).map(([id, info]) => ({
      id,
      tokens: info.tokens,
      price: info.price,
    }));
  }

  async subscribeToPlan(plan: SubscriptionPlan): Promise<void> {
    try {
      await this.billingService.subscribe(plan.planName);
      // Page will reload after successful subscription
    } catch (error) {
      console.error('Subscription error:', error);
      if (error instanceof Error) {
        alert(`Subscription failed: ${error.message}`);
      } else {
        alert('Subscription failed. Please try again later.');
      }
    }
  }

  async purchaseTokenPack(packId: string): Promise<void> {
    try {
      const result = await this.billingService.purchaseTokens(packId);

      // Refresh data after successful purchase
      this.loadSubscriptionStatus();
      this.loadTokenHistory();
      this.userService.refreshTokenInfo();
    } catch (error) {
      // More detailed error handling
      if (error && typeof error === 'object' && 'responseCode' in error) {
        const responseCode = (error as any).responseCode;

        switch (responseCode) {
          case 1:
            alert(
              'Purchase was canceled. No worries, you can try again anytime!'
            );
            break;
          case 7:
            alert('You already own this item.');
            break;
          default:
            alert(
              `Purchase failed with code ${responseCode}. Please try again.`
            );
        }
      } else if (error instanceof Error) {
        alert(`Token purchase failed: ${error.message}`);
      } else {
        alert('Token purchase failed. Please try again later.');
      }
    }
  }

  cancelSubscription(): void {
    if (
      confirm(
        "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period."
      )
    ) {
      this.billingService.cancelSubscription().subscribe({
        next: (status) => {
          this.subscriptionStatus = status;
          alert('Your subscription has been cancelled.');
        },
        error: (error) => {
          console.error('Error cancelling subscription:', error);
          alert('Failed to cancel subscription. Please try again.');
        },
      });
    }
  }

  copyReferralCode(): void {
    navigator.clipboard
      .writeText(this.referralCode)
      .then(() => {
        alert('Referral code copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy referral code');
      });
  }
}
