import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorGooglePlayBilling } from './google-play-billing.native';

export interface ProductDetail {
  productId: string;
  type: 'inapp' | 'subs';
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
  title: string;
  description: string;
}

export interface Purchase {
  orderId: string;
  packageName: string;
  productId: string;
  purchaseTime: number;
  purchaseState: number;
  purchaseToken: string;
  autoRenewing?: boolean;
  acknowledged: boolean;
}

export interface BillingResult {
  responseCode: number;
  debugMessage?: string;
}

export interface PurchaseResult extends BillingResult {
  purchases?: Purchase[];
}

@Injectable({
  providedIn: 'root',
})
export class GooglePlayBillingService {
  private isNative = Capacitor.isNativePlatform();
  private isInitialized = false;

  constructor() {}

  /**
   * Initialize Google Play Billing
   */
  async initialize(): Promise<void> {
    if (!this.isNative) {
      console.log('Google Play Billing: Running in web mode');
      this.isInitialized = true;
      return;
    }

    try {
      const result = await CapacitorGooglePlayBilling.startConnection();
      if (result.responseCode === 0) {
        // BILLING_RESPONSE_RESULT_OK
        this.isInitialized = true;
        console.log('Google Play Billing: Connection established');
      } else {
        throw new Error(`Billing connection failed: ${result.debugMessage}`);
      }
    } catch (error) {
      console.error('Google Play Billing initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check if billing is available and initialized
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Query product details from Google Play
   */
  async queryProductDetails(
    productIds: string[],
    type: 'inapp' | 'subs'
  ): Promise<ProductDetail[]> {
    if (!this.isNative) {
      // Return mock data for web development
      return this.getMockProductDetails(productIds, type);
    }

    if (!this.isInitialized) {
      throw new Error('Billing service not initialized');
    }

    try {
      const result = await CapacitorGooglePlayBilling.querySkuDetails({
        skuList: productIds,
        skuType: type,
      });

      return result.skuDetailsList || [];
    } catch (error) {
      console.error('Failed to query product details:', error);
      throw error;
    }
  }

  /**
   * Launch purchase flow
   */
  async launchPurchaseFlow(
    productId: string,
    type: 'inapp' | 'subs'
  ): Promise<PurchaseResult> {
    if (!this.isNative) {
      // Return mock purchase for web development
      return this.getMockPurchase(productId, type);
    }

    if (!this.isInitialized) {
      throw new Error('Billing service not initialized');
    }

    try {
      const result = await CapacitorGooglePlayBilling.launchBillingFlow({
        sku: productId,
        skuType: type,
      });

      return result;
    } catch (error) {
      console.error('Purchase flow failed:', error);
      throw error;
    }
  }

  /**
   * Query existing purchases
   */
  async queryPurchases(type: 'inapp' | 'subs'): Promise<Purchase[]> {
    if (!this.isNative) {
      // Return empty array for web development
      return [];
    }

    if (!this.isInitialized) {
      throw new Error('Billing service not initialized');
    }

    try {
      const result = await CapacitorGooglePlayBilling.queryPurchases({
        skuType: type,
      });

      return result.purchasesList || [];
    } catch (error) {
      console.error('Failed to query purchases:', error);
      throw error;
    }
  }

  /**
   * Acknowledge a purchase
   */
  async acknowledgePurchase(purchaseToken: string): Promise<void> {
    if (!this.isNative) {
      console.log('Mock: Acknowledging purchase token:', purchaseToken);
      return;
    }

    if (!this.isInitialized) {
      throw new Error('Billing service not initialized');
    }

    try {
      await CapacitorGooglePlayBilling.acknowledgePurchase({
        purchaseToken,
      });
    } catch (error) {
      console.error('Failed to acknowledge purchase:', error);
      throw error;
    }
  }

  /**
   * Consume a purchase (for consumable products like tokens)
   */
  async consumePurchase(purchaseToken: string): Promise<void> {
    if (!this.isNative) {
      console.log('Mock: Consuming purchase token:', purchaseToken);
      return;
    }

    if (!this.isInitialized) {
      throw new Error('Billing service not initialized');
    }

    try {
      await CapacitorGooglePlayBilling.consumePurchase({
        purchaseToken,
      });
    } catch (error) {
      console.error('Failed to consume purchase:', error);
      throw error;
    }
  }

  /**
   * End the billing connection
   */
  async endConnection(): Promise<void> {
    if (!this.isNative) {
      return;
    }

    try {
      await CapacitorGooglePlayBilling.endConnection();
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to end billing connection:', error);
    }
  }

  /**
   * Mock product details for web development
   */
  private getMockProductDetails(
    productIds: string[],
    type: 'inapp' | 'subs'
  ): ProductDetail[] {
    const mockDetails: ProductDetail[] = [];

    productIds.forEach((productId) => {
      let price = '$0.99';
      let title = productId;
      let description = `Mock ${type} product`;

      if (productId.includes('tokens_10')) {
        price = '$0.99';
        title = '10 Tokens';
        description = 'Get 10 premium tokens';
      } else if (productId.includes('tokens_25')) {
        price = '$1.99';
        title = '25 Tokens';
        description = 'Get 25 premium tokens';
      } else if (productId.includes('tokens_50')) {
        price = '$3.99';
        title = '50 Tokens';
        description = 'Get 50 premium tokens';
      } else if (productId.includes('tokens_100')) {
        price = '$6.99';
        title = '100 Tokens';
        description = 'Get 100 premium tokens';
      } else if (productId.includes('premium_monthly')) {
        price = '$2.99';
        title = 'Premium Monthly';
        description = 'Monthly premium subscription';
      } else if (productId.includes('premium_yearly')) {
        price = '$9.99';
        title = 'Premium Yearly';
        description = 'Yearly premium subscription';
      }

      mockDetails.push({
        productId,
        type,
        price,
        priceAmountMicros: parseFloat(price.replace('$', '')) * 1000000,
        priceCurrencyCode: 'USD',
        title,
        description,
      });
    });

    return mockDetails;
  }

  /**
   * Mock purchase for web development
   */
  private getMockPurchase(
    productId: string,
    type: 'inapp' | 'subs'
  ): Promise<PurchaseResult> {
    return new Promise((resolve) => {
      // Simulate user decision
      const confirmed = confirm(
        `Purchase ${productId}?\n\nThis is a development simulation.`
      );

      if (confirmed) {
        const mockPurchase: Purchase = {
          orderId: `mock_order_${Date.now()}`,
          packageName: 'com.example.habittracker',
          productId,
          purchaseTime: Date.now(),
          purchaseState: 1, // PURCHASED
          purchaseToken: `mock_token_${Date.now()}`,
          autoRenewing: type === 'subs',
          acknowledged: false,
        };

        resolve({
          responseCode: 0, // BILLING_RESPONSE_RESULT_OK
          purchases: [mockPurchase],
        });
      } else {
        resolve({
          responseCode: 1, // BILLING_RESPONSE_RESULT_USER_CANCELED
          debugMessage: 'User canceled the purchase',
        });
      }
    });
  }
}
