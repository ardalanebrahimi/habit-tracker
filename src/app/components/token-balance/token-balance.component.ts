import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService, UserTokenInfo } from '../../services/user.service';

@Component({
  selector: 'app-token-balance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './token-balance.component.html',
  styleUrls: ['./token-balance.component.scss'],
})
export class TokenBalanceComponent implements OnInit, OnDestroy {
  @Input() compact = false;
  @Input() showWhenEmpty = true;
  @Input() lowBalanceThreshold = 3;

  tokenInfo: UserTokenInfo | null = null;
  private subscription?: Subscription;

  constructor(private userService: UserService, private router: Router) {}

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

  onTokenBalanceClick(): void {
    if (!this.compact) {
      this.router.navigate(['/subscription']);
    }
  }
}
