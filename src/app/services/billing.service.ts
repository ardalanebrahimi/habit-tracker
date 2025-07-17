import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { UserService, SubscriptionStatus } from './user.service';
import { PurchaseService } from './purchase.service';

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
  getTokenPackInfo() {
    return this.purchaseService.getTokenPackInfo();
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
      await this.purchaseService.purchaseProduct(productId);
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
