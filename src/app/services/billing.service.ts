import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserTokenInfo, SubscriptionStatus } from './user.service';

export interface SubscriptionPlan {
  id: string;
  planName: string;
  displayName: string;
  price: number;
  currency: string;
  durationMonths: number;
  tokensIncluded: number;
  habitLimit: number;
  features: string[];
  isActive: boolean;
}

export interface PurchaseVerificationRequest {
  purchaseToken: string;
  productId: string;
  orderId?: string;
  purchaseType: 'TokenPack' | 'Subscription';
}

export interface TokenPurchaseRequest {
  purchaseToken: string;
  productId: string;
  orderId?: string;
  tokenAmount: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Get available subscription plans
   */
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(
      `${this.apiUrl}/subscription-plans`
    );
  }

  /**
   * Verify token purchase with Google Play
   */
  verifyTokenPurchase(
    request: TokenPurchaseRequest
  ): Observable<UserTokenInfo> {
    return this.http.post<UserTokenInfo>(
      `${this.apiUrl}/verify-token-purchase`,
      request
    );
  }

  /**
   * Verify subscription purchase with Google Play
   */
  verifySubscription(
    request: PurchaseVerificationRequest
  ): Observable<SubscriptionStatus> {
    return this.http.post<SubscriptionStatus>(
      `${this.apiUrl}/verify-subscription`,
      request
    );
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(): Observable<SubscriptionStatus> {
    return this.http.post<SubscriptionStatus>(
      `${this.apiUrl}/cancel-subscription`,
      {}
    );
  }

  /**
   * Restore purchases (for app reinstalls)
   */
  restorePurchases(): Observable<SubscriptionStatus> {
    return this.http.post<SubscriptionStatus>(
      `${this.apiUrl}/restore-purchases`,
      {}
    );
  }

  /**
   * Get token pack information
   */
  getTokenPackInfo(): { [key: string]: { tokens: number; price: number } } {
    return {
      tokens_10: { tokens: 10, price: 0.99 },
      tokens_25: { tokens: 25, price: 1.99 },
      tokens_50: { tokens: 50, price: 3.99 },
      tokens_100: { tokens: 100, price: 6.99 },
    };
  }

  /**
   * Purchase tokens through Google Play (to be implemented with Capacitor plugin)
   */
  async purchaseTokens(productId: string): Promise<void> {
    // TODO: Implement Google Play billing with Capacitor
    // This would integrate with @capacitor-community/in-app-purchases
    console.log('Token purchase requested for:', productId);
    throw new Error('Google Play billing not yet implemented');
  }

  /**
   * Subscribe through Google Play (to be implemented with Capacitor plugin)
   */
  async subscribe(planId: string): Promise<void> {
    // TODO: Implement Google Play billing with Capacitor
    console.log('Subscription requested for:', planId);
    throw new Error('Google Play billing not yet implemented');
  }
}
