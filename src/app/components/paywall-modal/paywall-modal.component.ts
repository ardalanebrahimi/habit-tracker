import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PaywallService, PaywallConfig } from '../../services/paywall.service';
import { UserService, UserTokenInfo } from '../../services/user.service';
import { BillingService } from '../../services/billing.service';

@Component({
  selector: 'app-paywall-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="paywallConfig"
      class="paywall-overlay"
      (click)="onOverlayClick($event)"
    >
      <div class="paywall-modal" (click)="$event.stopPropagation()">
        <div class="paywall-header">
          <h3>{{ paywallConfig.title }}</h3>
          <button class="close-button" (click)="cancel()">×</button>
        </div>

        <div class="paywall-content">
          <p class="paywall-message">{{ paywallConfig.message }}</p>

          <!-- Token Balance Display -->
          <div class="token-balance" *ngIf="tokenInfo">
            <div class="balance-item">
              <span class="balance-label">Your tokens:</span>
              <span class="balance-value">{{ tokenInfo.tokenBalance }}</span>
            </div>
            <div
              class="balance-item"
              *ngIf="tokenInfo.subscriptionTier !== 'free'"
            >
              <span class="balance-label">Plan:</span>
              <span class="balance-value premium">{{
                getSubscriptionDisplayName(tokenInfo.subscriptionTier)
              }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="paywall-actions">
            <!-- Spend Tokens Option -->
            <button
              *ngIf="canSpendTokens()"
              class="action-button primary"
              (click)="spendTokens()"
            >
              <span class="button-icon">🪙</span>
              <div class="button-content">
                <div class="button-title">
                  Use {{ paywallConfig.tokenCost }} Token{{
                    paywallConfig.tokenCost > 1 ? 's' : ''
                  }}
                </div>
                <div class="button-subtitle">Continue with current action</div>
              </div>
            </button>

            <!-- Upgrade Option -->
            <button
              class="action-button upgrade"
              (click)="showUpgradeOptions()"
            >
              <span class="button-icon">⭐</span>
              <div class="button-content">
                <div class="button-title">Upgrade to Premium</div>
                <div class="button-subtitle">
                  Unlimited habits + monthly tokens
                </div>
              </div>
            </button>

            <!-- Buy Tokens Option -->
            <button class="action-button secondary" (click)="showTokenStore()">
              <span class="button-icon">🛒</span>
              <div class="button-content">
                <div class="button-title">Buy Tokens</div>
                <div class="button-subtitle">Starting from $0.99</div>
              </div>
            </button>

            <!-- Alternative Actions -->
            <div
              *ngIf="
                paywallConfig.showAlternatives && paywallConfig.alternatives
              "
              class="alternatives"
            >
              <div class="alternatives-divider">
                <span>or</span>
              </div>
              <button
                *ngFor="let alt of paywallConfig.alternatives"
                class="action-button alternative"
                (click)="selectAlternative()"
              >
                <div class="button-content">
                  <div class="button-title">{{ alt.title }}</div>
                  <div class="button-subtitle">{{ alt.description }}</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Earn Tokens Hint -->
          <div class="earn-tokens-hint">
            <p><strong>💡 Tip:</strong> Earn free tokens by:</p>
            <ul>
              <li>Completing daily habits (streak bonuses)</li>
              <li>Inviting friends</li>
              <li>Daily login rewards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .paywall-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }

      .paywall-modal {
        background: white;
        border-radius: 16px;
        max-width: 480px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
      }

      .paywall-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px 0;
        border-bottom: 1px solid #e5e7eb;
        margin-bottom: 20px;
      }

      .paywall-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
      }

      .close-button:hover {
        color: #374151;
      }

      .paywall-content {
        padding: 0 24px 24px;
      }

      .paywall-message {
        color: #4b5563;
        line-height: 1.5;
        margin-bottom: 20px;
      }

      .token-balance {
        background: #f9fafb;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      }

      .balance-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .balance-item:last-child {
        margin-bottom: 0;
      }

      .balance-label {
        color: #6b7280;
        font-size: 14px;
      }

      .balance-value {
        font-weight: 600;
        color: #1f2937;
      }

      .balance-value.premium {
        color: #7c3aed;
      }

      .paywall-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
      }

      .action-button {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }

      .action-button.primary {
        border-color: #3b82f6;
        background: #3b82f6;
        color: white;
      }

      .action-button.primary:hover {
        background: #2563eb;
      }

      .action-button.upgrade {
        border-color: #7c3aed;
        background: #7c3aed;
        color: white;
      }

      .action-button.upgrade:hover {
        background: #6d28d9;
      }

      .action-button.secondary {
        border-color: #d1d5db;
        color: #374151;
      }

      .action-button.secondary:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      .action-button.alternative {
        border-color: #e5e7eb;
        color: #6b7280;
      }

      .action-button.alternative:hover {
        background: #f9fafb;
        border-color: #d1d5db;
      }

      .button-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .button-content {
        flex: 1;
      }

      .button-title {
        font-weight: 600;
        margin-bottom: 2px;
      }

      .button-subtitle {
        font-size: 13px;
        opacity: 0.8;
      }

      .alternatives {
        margin-top: 20px;
      }

      .alternatives-divider {
        text-align: center;
        margin: 16px 0;
        position: relative;
        color: #9ca3af;
      }

      .alternatives-divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: #e5e7eb;
        z-index: -1;
      }

      .alternatives-divider span {
        background: white;
        padding: 0 12px;
      }

      .earn-tokens-hint {
        background: #fef3c7;
        border: 1px solid #fbbf24;
        border-radius: 8px;
        padding: 16px;
        margin-top: 20px;
      }

      .earn-tokens-hint p {
        margin: 0 0 8px;
        color: #92400e;
        font-size: 14px;
      }

      .earn-tokens-hint ul {
        margin: 0;
        padding-left: 16px;
        color: #92400e;
        font-size: 13px;
      }

      .earn-tokens-hint li {
        margin-bottom: 4px;
      }

      @media (max-width: 640px) {
        .paywall-modal {
          margin: 20px;
          max-height: calc(100vh - 40px);
        }

        .paywall-header,
        .paywall-content {
          padding-left: 20px;
          padding-right: 20px;
        }
      }
    `,
  ],
})
export class PaywallModalComponent implements OnInit, OnDestroy {
  paywallConfig: PaywallConfig | null = null;
  tokenInfo: UserTokenInfo | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private paywallService: PaywallService,
    private userService: UserService,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    // Subscribe to paywall state
    this.subscriptions.push(
      this.paywallService.getPaywallState().subscribe((config) => {
        this.paywallConfig = config;
      })
    );

    // Subscribe to token info
    this.subscriptions.push(
      this.userService.getTokenInfoObservable().subscribe((info) => {
        this.tokenInfo = info;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  canSpendTokens(): boolean {
    if (!this.tokenInfo || !this.paywallConfig) return false;
    return this.tokenInfo.tokenBalance >= this.paywallConfig.tokenCost;
  }

  spendTokens(): void {
    this.paywallService.spendTokens();
  }

  showUpgradeOptions(): void {
    this.paywallService.showUpgradeOptions();
  }

  showTokenStore(): void {
    // Navigate to token store or show token purchase options
    console.log('Show token store');
  }

  selectAlternative(): void {
    this.paywallService.selectAlternative();
  }

  cancel(): void {
    this.paywallService.cancel();
  }

  onOverlayClick(event: Event): void {
    // Close modal when clicking overlay
    this.cancel();
  }

  getSubscriptionDisplayName(tier: string): string {
    switch (tier) {
      case 'premium_monthly':
        return 'Premium Monthly';
      case 'premium_yearly':
        return 'Premium Yearly';
      default:
        return 'Free';
    }
  }
}
