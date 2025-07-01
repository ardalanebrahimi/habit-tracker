import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserTokenInfo {
  tokenBalance: number;
  subscriptionTier: string;
  subscriptionExpiresAt?: string;
  habitLimit: number;
  habitsCreated: number;
  canCreateHabits: boolean;
  nextTokenRefresh?: string;
}

export interface SubscriptionStatus {
  subscriptionTier: string;
  expiresAt?: string;
  isActive: boolean;
  autoRenew: boolean;
  features: string[];
  habitLimit: number;
  tokensIncluded: number;
}

export interface TokenTransaction {
  id: string;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

export interface SpendTokenRequest {
  transactionType: string;
  description?: string;
  relatedEntityId?: string;
  amount: number;
}

export interface EarnTokenRequest {
  transactionType: string;
  description?: string;
  relatedEntityId?: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;
  private tokenInfo = new BehaviorSubject<UserTokenInfo | null>(null);

  constructor(private http: HttpClient) {
    this.loadTokenInfo();
  }

  /**
   * Get current user's token information
   */
  getTokenInfo(): Observable<UserTokenInfo> {
    return this.http.get<UserTokenInfo>(`${this.apiUrl}/token-balance`);
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(): Observable<SubscriptionStatus> {
    return this.http.get<SubscriptionStatus>(
      `${this.apiUrl}/subscription/status`
    );
  }

  /**
   * Check if user has tokens available for AI features
   */
  hasTokensAvailable(): boolean {
    const current = this.tokenInfo.value;
    return current ? current.tokenBalance > 0 : false;
  }

  /**
   * Check if user can create habits
   */
  canCreateHabits(): boolean {
    const current = this.tokenInfo.value;
    return current ? current.canCreateHabits : false;
  }

  /**
   * Get current token info as observable
   */
  getTokenInfoObservable(): Observable<UserTokenInfo | null> {
    return this.tokenInfo.asObservable();
  }

  /**
   * Spend tokens for various actions
   */
  spendTokens(request: SpendTokenRequest): Observable<UserTokenInfo> {
    return this.http.post<UserTokenInfo>(`${this.apiUrl}/spend-token`, request);
  }

  /**
   * Earn tokens for various actions
   */
  earnTokens(request: EarnTokenRequest): Observable<UserTokenInfo> {
    return this.http.post<UserTokenInfo>(`${this.apiUrl}/earn-token`, request);
  }

  /**
   * Get token transaction history
   */
  getTokenHistory(
    page: number = 1,
    pageSize: number = 20
  ): Observable<TokenTransaction[]> {
    return this.http.get<TokenTransaction[]>(
      `${this.apiUrl}/token-history?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get referral code
   */
  getReferralCode(): Observable<{ referralCode: string }> {
    return this.http.get<{ referralCode: string }>(
      `${this.apiUrl}/referral-code`
    );
  }

  /**
   * Apply referral code
   */
  applyReferralCode(referralCode: string): Observable<UserTokenInfo> {
    return this.http.post<UserTokenInfo>(`${this.apiUrl}/apply-referral`, {
      referralCode,
    });
  }

  /**
   * Load token info from backend
   */
  private loadTokenInfo(): void {
    this.getTokenInfo().subscribe({
      next: (tokenInfo) => {
        this.tokenInfo.next(tokenInfo);
      },
      error: (error) => {
        console.error('Failed to load token info:', error);
        // Set default tokens for development
        this.tokenInfo.next({
          tokenBalance: 5,
          subscriptionTier: 'free',
          habitLimit: 5,
          habitsCreated: 0,
          canCreateHabits: true,
        });
      },
    });
  }

  /**
   * Update token info after consumption
   */
  updateTokenInfo(tokenInfo: UserTokenInfo): void {
    this.tokenInfo.next(tokenInfo);
  }

  /**
   * Refresh token info from server
   */
  refreshTokenInfo(): void {
    this.loadTokenInfo();
  }
}
