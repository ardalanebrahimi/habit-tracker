import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

// Cordova plugin purchase types
declare var CdvPurchase: any;

// Extend window interface
declare global {
  interface Window {
    CdvPurchase?: any;
  }
}

export interface ProductInfo {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  type:
    | 'CONSUMABLE'
    | 'NON_CONSUMABLE'
    | 'NON_RENEWING_SUBSCRIPTION'
    | 'PAID_SUBSCRIPTION';
}

export interface PurchaseInfo {
  id: string;
  productId: string;
  transactionId: string;
  purchaseToken: string;
  purchaseTime: number;
  quantity: number;
  state: 'PENDING' | 'APPROVED' | 'FINISHED' | 'CANCELLED';
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private isNative = Capacitor.isNativePlatform();
  private isInitialized = false;
  private store: any;

  constructor() {}

  /**
   * Initialize the purchase service
   */
  async initialize(): Promise<void> {
    if (!this.isNative) {
      console.log('Purchase Service: Running in web mode');
      this.isInitialized = true;
      return;
    }

    try {
      // Wait for device ready
      await this.waitForDeviceReady();

      if (!window.CdvPurchase) {
        throw new Error('cordova-plugin-purchase not available');
      }

      // Initialize the store
      this.store = CdvPurchase.store;

      // Set up error handler
      this.store.error((error: any) => {
        console.error('Purchase error:', error);
        console.error('errorXX:', JSON.stringify(error, null, 2));
      });

      // Enable debug logging in development
      if (!environment.production) {
        this.store.verbosity = this.store.DEBUG;
      }

      // Register products
      await this.registerProducts();

      // Set up purchase handlers
      this.setupPurchaseHandlers();

      // Initialize the store
      await new Promise<void>((resolve, reject) => {
        this.store.ready(() => {
          console.log('Purchase Service: Store ready');
          this.isInitialized = true;
          resolve();
        });

        this.store.error((error: any) => {
          console.error('Store initialization error:', error);
          reject(error);
        });

        this.store.initialize(this.store.GOOGLE_PLAY);
      });
    } catch (error) {
      console.error('Purchase Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Wait for device ready event
   */
  private waitForDeviceReady(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        document.addEventListener('deviceready', () => resolve(), false);
      }
    });
  }

  /**
   * Register products with the store
   */
  private async registerProducts(): Promise<void> {
    // Token packs (consumable)
    this.store.register([
      {
        id: 'tokens_10',
        type: this.store.CONSUMABLE,
        platform: this.store.GOOGLE_PLAY,
      },
      {
        id: 'tokens_25',
        type: this.store.CONSUMABLE,
        platform: this.store.GOOGLE_PLAY,
      },
      {
        id: 'tokens_50',
        type: this.store.CONSUMABLE,
        platform: this.store.GOOGLE_PLAY,
      },
      {
        id: 'tokens_100',
        type: this.store.CONSUMABLE,
        platform: this.store.GOOGLE_PLAY,
      },
    ]);

    // Subscription plans
    this.store.register([
      {
        id: 'premium_monthly',
        type: this.store.PAID_SUBSCRIPTION,
        platform: this.store.GOOGLE_PLAY,
      },
      {
        id: 'premium_yearly',
        type: this.store.PAID_SUBSCRIPTION,
        platform: this.store.GOOGLE_PLAY,
      },
    ]);
  }

  /**
   * Set up purchase event handlers
   */
  private setupPurchaseHandlers(): void {
    this.store
      .when()
      .productUpdated((product: any) => {
        console.log('Product updated:', product);
      })
      .approved((transaction: any) => {
        console.log('Transaction approved:', JSON.stringify(transaction));
        this.finishPurchase(transaction);
      })
      .verified((receipt: any) => {
        console.log('Receipt verified:', JSON.stringify(receipt));
      })
      .finished((transaction: any) => {
        console.log('Transaction finished:', JSON.stringify(transaction));
        this.refreshUI();
      });
  }

  refreshUI() {
    console.log('Refreshing UI after product update');
  }
  finishPurchase(transaction: any) {
    console.log('Finishing purchase:', transaction);
    transaction?.finish();
    this.refreshUI();
  }

  /**
   * Check if purchase service is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<PurchaseInfo> {
    console.log(`🛒 Initiating purchase for product: ${productId}`);

    if (!this.isInitialized) {
      throw new Error('Purchase service not initialized');
    }

    if (!this.isNative) {
      console.log(`🌐 Running in web mode, using mock purchase`);
      // Mock purchase for web
      return this.mockPurchase(productId);
    }

    console.log(`📱 Running in native mode, using cordova-plugin-purchase`);

    return new Promise((resolve, reject) => {
      const product = this.store.get(productId);
      if (!product) {
        reject(new Error('Product not found'));
        return;
      }
      product.getOffer().order();
    });
  }

  /**
   * Mock purchase for web development
   */
  private async mockPurchase(productId: string): Promise<PurchaseInfo> {
    console.log(`🛒 [DEV MODE] Simulating purchase for product: ${productId}`);

    // Simulate purchase delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = {
      id: `mock_${Date.now()}`,
      productId,
      transactionId: `mock_tx_${Date.now()}`,
      purchaseToken: `mock_token_${Date.now()}`,
      purchaseTime: Date.now(),
      quantity: 1,
      state: 'APPROVED' as const,
    };

    console.log(`✅ [DEV MODE] Mock purchase completed:`, result);
    return result;
  }
}
