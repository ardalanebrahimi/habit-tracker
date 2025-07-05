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
  template: `
    <div class="subscription-management">
      <div class="header">
        <h2>Subscription & Tokens</h2>
        <app-token-balance></app-token-balance>
      </div>

      <!-- Current Subscription Status -->
      <div class="subscription-status">
        <h3>Current Plan</h3>
        <div class="status-card" [class.premium]="subscriptionStatus?.isActive">
          <div class="status-info">
            <div class="plan-name">
              {{
                getDisplayName(subscriptionStatus?.subscriptionTier || 'free')
              }}
            </div>
            <div class="plan-details" *ngIf="subscriptionStatus?.isActive">
              <p *ngIf="subscriptionStatus?.expiresAt">
                Expires: {{ subscriptionStatus?.expiresAt | date : 'medium' }}
              </p>
              <p>
                Auto-renew: {{ subscriptionStatus?.autoRenew ? 'Yes' : 'No' }}
              </p>
            </div>
            <div class="plan-features">
              <div
                class="feature"
                *ngFor="let feature of subscriptionStatus?.features"
              >
                ✓ {{ feature }}
              </div>
            </div>
          </div>
          <div class="status-actions" *ngIf="subscriptionStatus?.isActive">
            <button class="btn-secondary" (click)="cancelSubscription()">
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>

      <!-- Available Plans -->
      <div class="available-plans" *ngIf="!subscriptionStatus?.isActive">
        <h3>Upgrade to Premium</h3>
        <div class="plans-grid">
          <div
            *ngFor="let plan of subscriptionPlans"
            class="plan-card"
            [class.recommended]="plan.planName === 'premium_yearly'"
          >
            <div class="plan-badge" *ngIf="plan.planName === 'premium_yearly'">
              🎉 Best Value
            </div>

            <div class="plan-header">
              <h4>{{ plan.displayName }}</h4>
              <div class="plan-price">
                <span class="price">{{ plan.price | currency }}</span>
                <span class="period">{{
                  plan.durationMonths === 1 ? '/month' : '/year'
                }}</span>
              </div>
              <div class="savings" *ngIf="plan.planName === 'premium_yearly'">
                Save 58%
              </div>
            </div>

            <div class="plan-features">
              <div class="feature" *ngFor="let feature of plan.features">
                ✓ {{ feature }}
              </div>
            </div>

            <button class="btn-primary" (click)="subscribeToPlan(plan)">
              Choose {{ plan.displayName }}
            </button>
          </div>
        </div>
      </div>

      <!-- Token Packs -->
      <div class="token-packs">
        <h3>Buy Tokens</h3>
        <p class="token-description">
          Need more tokens? Purchase token packs for instant access to premium
          features.
        </p>

        <div class="packs-grid">
          <div
            *ngFor="let pack of getTokenPacks()"
            class="pack-card"
            [class.popular]="pack.id === 'tokens_50'"
          >
            <div class="pack-badge" *ngIf="pack.id === 'tokens_50'">
              💰 Popular
            </div>

            <div class="pack-tokens">
              <span class="token-amount">{{ pack.tokens }}</span>
              <span class="token-label">tokens</span>
            </div>

            <div class="pack-price">
              {{ pack.price | currency }}
            </div>

            <div class="pack-value">
              {{
                pack.price / pack.tokens | currency : 'USD' : 'symbol' : '1.3-3'
              }}
              per token
            </div>

            <button class="btn-secondary" (click)="purchaseTokenPack(pack.id)">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <!-- Token History -->
      <div class="token-history">
        <h3>Token History</h3>
        <div
          class="history-list"
          *ngIf="tokenHistory.length > 0; else noHistory"
        >
          <div
            *ngFor="let transaction of tokenHistory"
            class="history-item"
            [class.earn]="transaction.amount > 0"
            [class.spend]="transaction.amount < 0"
          >
            <div class="transaction-info">
              <div class="transaction-description">
                {{ transaction.description }}
              </div>
              <div class="transaction-date">
                {{ transaction.createdAt | date : 'short' }}
              </div>
            </div>

            <div class="transaction-amount">
              <span class="amount" [class.positive]="transaction.amount > 0">
                {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}
              </span>
              <span class="token-icon">🪙</span>
            </div>
          </div>
        </div>

        <ng-template #noHistory>
          <div class="no-history">
            <p>No token transactions yet.</p>
            <p>Start using tokens by creating habits or using AI features!</p>
          </div>
        </ng-template>
      </div>

      <!-- Referral Section -->
      <div class="referral-section">
        <h3>Invite Friends, Earn Tokens</h3>
        <div class="referral-card">
          <div class="referral-info">
            <p>
              Share your referral code and earn <strong>2 tokens</strong> for
              each friend who joins!
            </p>
            <div class="referral-code" *ngIf="referralCode">
              <label>Your referral code:</label>
              <div class="code-display">
                <span class="code">{{ referralCode }}</span>
                <button class="copy-btn" (click)="copyReferralCode()">
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .subscription-management {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
      }

      .header h2 {
        margin: 0;
        color: #1f2937;
        font-size: 28px;
        font-weight: 700;
      }

      .status-card,
      .plan-card,
      .pack-card,
      .referral-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 16px;
        transition: all 0.2s;
      }

      .status-card.premium {
        border-color: #7c3aed;
        background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      }

      .plan-card.recommended,
      .pack-card.popular {
        border-color: #3b82f6;
        position: relative;
        transform: scale(1.02);
      }

      .plan-badge,
      .pack-badge {
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        background: #3b82f6;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 16px;
      }

      .packs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-top: 16px;
      }

      .plan-header h4 {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
      }

      .plan-price {
        margin-bottom: 8px;
      }

      .price {
        font-size: 32px;
        font-weight: 700;
        color: #1f2937;
      }

      .period {
        color: #6b7280;
        font-size: 16px;
      }

      .savings {
        color: #059669;
        font-weight: 600;
        font-size: 14px;
      }

      .plan-features {
        margin: 20px 0;
      }

      .feature {
        color: #374151;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .pack-tokens {
        text-align: center;
        margin-bottom: 12px;
      }

      .token-amount {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
      }

      .token-label {
        color: #6b7280;
        font-size: 14px;
        margin-left: 4px;
      }

      .pack-price {
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
      }

      .pack-value {
        text-align: center;
        color: #6b7280;
        font-size: 12px;
        margin-bottom: 16px;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
      }

      .btn-primary:hover {
        background: #2563eb;
      }

      .btn-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
      }

      .btn-secondary:hover {
        background: #f9fafb;
      }

      .history-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
      }

      .history-item:last-child {
        border-bottom: none;
      }

      .transaction-description {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
      }

      .transaction-date {
        color: #6b7280;
        font-size: 12px;
      }

      .transaction-amount {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .amount {
        font-weight: 600;
        font-size: 16px;
      }

      .amount.positive {
        color: #059669;
      }

      .referral-code {
        margin-top: 16px;
      }

      .code-display {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 8px;
      }

      .code {
        font-family: monospace;
        background: #f3f4f6;
        padding: 8px 12px;
        border-radius: 6px;
        font-weight: 600;
        color: #1f2937;
      }

      .copy-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
      }

      .copy-btn:hover {
        background: #2563eb;
      }

      .no-history {
        text-align: center;
        color: #6b7280;
        padding: 40px 20px;
      }

      @media (max-width: 768px) {
        .header {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
        }

        .plans-grid {
          grid-template-columns: 1fr;
        }

        .packs-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `,
  ],
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
      await this.billingService.purchaseTokens(packId);
      // Refresh data after successful purchase
      this.loadSubscriptionStatus();
      this.loadTokenHistory();
      this.userService.refreshTokenInfo();
    } catch (error) {
      console.error('Token purchase error:', error);
      if (error instanceof Error) {
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
