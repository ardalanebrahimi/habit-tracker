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
  ) {
    console.log('🛒 [BillingService] Constructor - isNative:', this.isNative);
    console.log(
      '🛒 [BillingService] Constructor - Capacitor.isNativePlatform():',
      Capacitor.isNativePlatform()
    );
    console.log(
      '🛒 [BillingService] Constructor - Platform info:',
      Capacitor.getPlatform()
    );
  }

  /**
   * Initialize Purchase Service
   */
  async initializeBilling(): Promise<void> {
    try {
      await this.purchaseService.initialize();
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
  async purchaseTokens(productId: string): Promise<void> {
    console.log(
      `🛒 [BillingService] purchaseTokens called for product: ${productId}`
    );
    console.log(`🛒 [BillingService] isNative: ${this.isNative}`);

    const tokenPacks = this.getTokenPackInfo();
    const packInfo = tokenPacks[productId];

    if (!packInfo) {
      throw new Error('Invalid token pack selected');
    }

    try {
      if (!this.purchaseService.isAvailable()) {
        console.log(
          `[BillingService] Purchase service not available, initializing...`
        );
        // Initialize purchase service if not available
        await this.purchaseService.initialize();
      }

      // Launch purchase flow
      console.log(
        `🛒 [BillingService] Launching purchase flow for ${productId}`
      );
      const purchaseResult = await this.purchaseService.purchaseProduct(
        productId
      );

      console.log(`🛒 [BillingService] Purchase result:`, purchaseResult);

      if (purchaseResult.state === 'APPROVED') {
        // In web/development mode, simulate success without backend verification
        const isCurrentlyNative = Capacitor.isNativePlatform();
        const platform = Capacitor.getPlatform();

        console.log(
          `🛒 [BillingService] Purchase approved - Platform: ${platform}`
        );
        console.log(
          `🛒 [BillingService] Purchase approved - isNative: ${this.isNative}`
        );
        console.log(
          `🛒 [BillingService] Purchase approved - isCurrentlyNative: ${isCurrentlyNative}`
        );

        if (!this.isNative || platform === 'web') {
          console.log(
            `🎉 [DEV MODE] Simulated purchase of ${packInfo.tokens} tokens for $${packInfo.price}`
          );
          console.log(
            `🎉 [DEV MODE] Skipping backend verification in web mode`
          );

          // Simulate token update (you can update this to match your user service structure)
          // For now, just show success message
          alert(
            `🎉 [Development Mode] Successfully simulated purchase of ${packInfo.tokens} tokens for $${packInfo.price}!\n\nIn production, this would be verified with Google Play.`
          );
          return;
        }

        // In native mode, verify purchase with backend
        console.log(
          `🛒 [BillingService] Native mode - verifying purchase with backend`
        );
        const verificationRequest: TokenPurchaseRequest = {
          purchaseToken: purchaseResult.purchaseToken,
          productId: purchaseResult.productId,
          orderId: purchaseResult.transactionId,
          tokenAmount: packInfo.tokens,
          price: packInfo.price,
        };

        console.log(
          `🛒 [BillingService] Sending verification request:`,
          verificationRequest
        );
        const result = await this.verifyTokenPurchase(
          verificationRequest
        ).toPromise();

        // Update local token info
        this.userService.updateTokenInfo(result!);

        console.log(`Successfully purchased ${packInfo.tokens} tokens`);
        alert(
          `🎉 Success! You purchased ${packInfo.tokens} tokens for $${packInfo.price}`
        );
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
    console.log(`🛒 [BillingService] subscribe called for plan: ${planId}`);
    console.log(`🛒 [BillingService] isNative: ${this.isNative}`);

    try {
      if (!this.purchaseService.isAvailable()) {
        await this.purchaseService.initialize();
      }

      // Launch subscription flow
      console.log(
        `🛒 [BillingService] Launching subscription flow for ${planId}`
      );
      const purchaseResult = await this.purchaseService.purchaseProduct(planId);

      console.log(`🛒 [BillingService] Subscription result:`, purchaseResult);

      if (purchaseResult.state === 'APPROVED') {
        // In web/development mode, simulate success without backend verification
        const isCurrentlyNative = Capacitor.isNativePlatform();
        const platform = Capacitor.getPlatform();

        console.log(
          `🛒 [BillingService] Subscription approved - Platform: ${platform}`
        );
        console.log(
          `🛒 [BillingService] Subscription approved - isNative: ${this.isNative}`
        );
        console.log(
          `🛒 [BillingService] Subscription approved - isCurrentlyNative: ${isCurrentlyNative}`
        );

        if (!this.isNative || platform === 'web') {
          console.log(
            `🎉 [DEV MODE] Simulated subscription to plan: ${planId}`
          );
          console.log(
            `🎉 [DEV MODE] Skipping backend verification in web mode`
          );
          alert(
            `🎉 [Development Mode] Successfully simulated subscription to ${planId}!\n\nIn production, this would be verified with Google Play and you'd get unlimited habits and monthly tokens.`
          );
          return;
        }

        // In native mode, verify subscription with backend
        console.log(
          `🛒 [BillingService] Native mode - verifying subscription with backend`
        );
        const verificationRequest: PurchaseVerificationRequest = {
          purchaseToken: purchaseResult.purchaseToken,
          productId: purchaseResult.productId,
          orderId: purchaseResult.transactionId,
          purchaseType: 'Subscription',
        };

        await this.verifySubscription(verificationRequest).toPromise();

        console.log(`Successfully subscribed to plan: ${planId}`);
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
