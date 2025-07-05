import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { UserService, UserTokenInfo, SubscriptionStatus } from './user.service';
import { GooglePlayBillingService } from './google-play-billing.service';

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
  private isNative = Capacitor.isNativePlatform();

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private googlePlayBilling: GooglePlayBillingService
  ) {}

  /**
   * Initialize Google Play Billing
   */
  async initializeBilling(): Promise<void> {
    try {
      await this.googlePlayBilling.initialize();
      console.log('Billing service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize billing:', error);
      throw error;
    }
  }

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
   * Purchase tokens through Google Play or web simulation
   */
  async purchaseTokens(productId: string): Promise<void> {
    const tokenPacks = this.getTokenPackInfo();
    const packInfo = tokenPacks[productId];

    if (!packInfo) {
      throw new Error('Invalid token pack selected');
    }

    try {
      if (!this.googlePlayBilling.isAvailable()) {
        await this.googlePlayBilling.initialize();
      }

      // Launch purchase flow
      const purchaseResult = await this.googlePlayBilling.launchPurchaseFlow(
        productId,
        'inapp'
      );

      if (
        purchaseResult.responseCode === 0 &&
        purchaseResult.purchases &&
        purchaseResult.purchases.length > 0
      ) {
        const purchase = purchaseResult.purchases[0];

        // Verify purchase with backend
        const verificationRequest: TokenPurchaseRequest = {
          purchaseToken: purchase.purchaseToken,
          productId: purchase.productId,
          orderId: purchase.orderId,
          tokenAmount: packInfo.tokens,
          price: packInfo.price,
        };

        const result = await this.verifyTokenPurchase(
          verificationRequest
        ).toPromise();

        // Update local token info
        this.userService.updateTokenInfo(result!);

        // Consume the purchase (tokens are consumable)
        await this.googlePlayBilling.consumePurchase(purchase.purchaseToken);

        console.log(`Successfully purchased ${packInfo.tokens} tokens`);
        alert(
          `🎉 Success! You purchased ${packInfo.tokens} tokens for $${packInfo.price}`
        );
      } else if (purchaseResult.responseCode === 1) {
        // User canceled
        throw new Error('Purchase cancelled by user');
      } else {
        throw new Error('Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Token purchase failed:', error);
      throw error;
    }
  }

  /**
   * Subscribe through Google Play or web simulation
   */
  async subscribe(planId: string): Promise<void> {
    try {
      if (!this.googlePlayBilling.isAvailable()) {
        await this.googlePlayBilling.initialize();
      }

      // Launch subscription flow
      const purchaseResult = await this.googlePlayBilling.launchPurchaseFlow(
        planId,
        'subs'
      );

      if (
        purchaseResult.responseCode === 0 &&
        purchaseResult.purchases &&
        purchaseResult.purchases.length > 0
      ) {
        const purchase = purchaseResult.purchases[0];

        // Verify subscription with backend
        const verificationRequest: PurchaseVerificationRequest = {
          purchaseToken: purchase.purchaseToken,
          productId: purchase.productId,
          orderId: purchase.orderId,
          purchaseType: 'Subscription',
        };

        await this.verifySubscription(verificationRequest).toPromise();

        // Acknowledge the subscription
        await this.googlePlayBilling.acknowledgePurchase(
          purchase.purchaseToken
        );

        console.log(`Successfully subscribed to plan: ${planId}`);
        alert(
          `🎉 Success! You've subscribed to the premium plan. Enjoy unlimited habits and monthly tokens!`
        );

        // Reload to reflect changes
        window.location.reload();
      } else if (purchaseResult.responseCode === 1) {
        // User canceled
        throw new Error('Subscription cancelled by user');
      } else {
        throw new Error('Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      throw error;
    }
  }
}
