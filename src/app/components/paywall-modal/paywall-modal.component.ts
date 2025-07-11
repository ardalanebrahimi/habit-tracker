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
  templateUrl: './paywall-modal.component.html',
  styleUrls: ['./paywall-modal.component.scss'],
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
    throw new Error('Method not implemented.');
    // this.billingService.openTokenStore(); // Uncomment when billing service is
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
