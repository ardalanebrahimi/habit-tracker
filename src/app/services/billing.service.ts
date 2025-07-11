import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { UserService, UserTokenInfo, SubscriptionStatus } from './user.service';
import { PurchaseService, PurchaseInfo } from './purchase.service';

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
    private purchaseService: PurchaseService
  ) {}

  /**
   * Initialize Purchase Service
   */
  async initializeBilling(): Promise<void> {
    try {
      await this.purchaseService.initialize();
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
   * Purchase tokens through Purchase Service
   */
  async purchaseTokens(productId: string): Promise<any> {
    const tokenPacks = this.getTokenPackInfo();
    const packInfo = tokenPacks[productId];

    if (!packInfo) {
      throw new Error('Invalid token pack selected');
    }

    try {
      if (!this.purchaseService.isAvailable()) {
        // Initialize purchase service if not available
        await this.purchaseService.initialize();
      }

      // Launch purchase flow
      const purchaseResult = await this.purchaseService.purchaseProduct(
        productId
      );

      if (purchaseResult.state === 'APPROVED') {
        // In web/development mode, simulate success without backend verification
        const isCurrentlyNative = Capacitor.isNativePlatform();
        const platform = Capacitor.getPlatform();

        if (!this.isNative || platform === 'web') {
          // Simulate token update (you can update this to match your user service structure)
          // For now, just show success message
          alert(
            `🎉 [Development Mode] Successfully simulated purchase of ${packInfo.tokens} tokens for $${packInfo.price}!\n\nIn production, this would be verified with Google Play.`
          );

          return purchaseResult;
        }

        // In native mode, verify purchase with backend
        const verificationRequest: TokenPurchaseRequest = {
          purchaseToken: purchaseResult.purchaseToken,
          productId: purchaseResult.productId,
          orderId: purchaseResult.transactionId,
          tokenAmount: packInfo.tokens,
          price: packInfo.price,
        };

        const result = await this.verifyTokenPurchase(
          verificationRequest
        ).toPromise();

        // Update local token info
        this.userService.updateTokenInfo(result!);

        alert(
          `🎉 Success! You purchased ${packInfo.tokens} tokens for $${packInfo.price}`
        );

        return purchaseResult;
      } else {
        throw new Error('Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Token purchase failed:', error);
      if (error instanceof Error && error.message.includes('cancelled')) {
        throw new Error('Purchase cancelled by user');
      }
      throw error;
    }
  }

  /**
   * Subscribe through Purchase Service
   */
  async subscribe(planId: string): Promise<void> {
    try {
      if (!this.purchaseService.isAvailable()) {
        await this.purchaseService.initialize();
      }

      // Launch subscription flow
      const purchaseResult = await this.purchaseService.purchaseProduct(planId);

      if (purchaseResult.state === 'APPROVED') {
        // In web/development mode, simulate success without backend verification
        const isCurrentlyNative = Capacitor.isNativePlatform();
        const platform = Capacitor.getPlatform();

        if (!this.isNative || platform === 'web') {
          alert(
            `🎉 [Development Mode] Successfully simulated subscription to ${planId}!\n\nIn production, this would be verified with Google Play and you'd get unlimited habits and monthly tokens.`
          );
          return;
        }

        // In native mode, verify subscription with backend
        const verificationRequest: PurchaseVerificationRequest = {
          purchaseToken: purchaseResult.purchaseToken,
          productId: purchaseResult.productId,
          orderId: purchaseResult.transactionId,
          purchaseType: 'Subscription',
        };

        await this.verifySubscription(verificationRequest).toPromise();

        alert(
          `🎉 Success! You've subscribed to the premium plan. Enjoy unlimited habits and monthly tokens!`
        );

        // Reload to reflect changes
        window.location.reload();
      } else {
        throw new Error('Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      if (error instanceof Error && error.message.includes('cancelled')) {
        throw new Error('Subscription cancelled by user');
      }
      throw error;
    }
  }
}
