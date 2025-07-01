import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService, UserTokenInfo } from '../../services/user.service';

@Component({
  selector: 'app-token-balance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      *ngIf="shouldShow"
      class="token-balance"
      [class.compact]="compact"
      [class.low-balance]="isLowBalance"
      [title]="getTooltipText()"
    >
      <div class="token-icon">🪙</div>
      <div class="token-info" *ngIf="!compact">
        <div class="token-count">{{ tokenInfo?.tokenBalance || 0 }}</div>
        <div class="token-label">tokens</div>
      </div>
      <div class="token-count-compact" *ngIf="compact">
        {{ tokenInfo?.tokenBalance || 0 }}
      </div>

      <!-- Warning indicator for low balance -->
      <div class="warning-indicator" *ngIf="isLowBalance && !compact">⚠️</div>
    </div>
  `,
  styles: [
    `
      .token-balance {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .token-balance:hover {
        background: #f3f4f6;
        border-color: #d1d5db;
      }

      .token-balance.compact {
        padding: 4px 8px;
        font-size: 12px;
      }

      .token-balance.low-balance {
        background: #fef2f2;
        border-color: #fca5a5;
        color: #dc2626;
      }

      .token-balance.low-balance:hover {
        background: #fee2e2;
      }

      .token-icon {
        font-size: 16px;
        line-height: 1;
      }

      .token-balance.compact .token-icon {
        font-size: 14px;
      }

      .token-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        line-height: 1;
      }

      .token-count {
        font-weight: 600;
        color: #1f2937;
      }

      .token-count-compact {
        font-weight: 600;
        color: #1f2937;
      }

      .token-label {
        font-size: 11px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .warning-indicator {
        font-size: 12px;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .token-balance.low-balance .token-count,
      .token-balance.low-balance .token-count-compact {
        color: #dc2626;
      }
    `,
  ],
})
export class TokenBalanceComponent implements OnInit, OnDestroy {
  @Input() compact = false;
  @Input() showWhenEmpty = true;
  @Input() lowBalanceThreshold = 3;

  tokenInfo: UserTokenInfo | null = null;
  private subscription?: Subscription;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.subscription = this.userService
      .getTokenInfoObservable()
      .subscribe((info) => {
        this.tokenInfo = info;
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get shouldShow(): boolean {
    if (!this.tokenInfo) return this.showWhenEmpty;
    return this.showWhenEmpty || this.tokenInfo.tokenBalance > 0;
  }

  get isLowBalance(): boolean {
    if (!this.tokenInfo) return false;
    return this.tokenInfo.tokenBalance <= this.lowBalanceThreshold;
  }

  getTooltipText(): string {
    if (!this.tokenInfo) return 'Token balance loading...';

    const balance = this.tokenInfo.tokenBalance;
    const subscription = this.tokenInfo.subscriptionTier;

    let tooltip = `You have ${balance} token${balance !== 1 ? 's' : ''}`;

    if (subscription !== 'free') {
      const planName =
        subscription === 'premium_monthly'
          ? 'Premium Monthly'
          : 'Premium Yearly';
      tooltip += ` (${planName} subscriber)`;
    }

    if (this.isLowBalance) {
      tooltip +=
        '\n⚠️ Low token balance - consider upgrading or earning more tokens';
    }

    tooltip +=
      '\n\nTokens are used for:\n• Creating habits (after free limit)\n• AI suggestions\n• Custom cheer messages';

    return tooltip;
  }
}
