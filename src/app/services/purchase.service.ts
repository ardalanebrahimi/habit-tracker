import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { TokenPurchaseRequest } from './billing.service';
import { Observable } from 'rxjs';
import { UserService, UserTokenInfo } from './user.service';
import { HttpClient } from '@angular/common/http';

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
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient, private userService: UserService) {}

  /**
   * Initialize the purchase service
   */
  async initialize(): Promise<void> {
    if (!this.isNative) {
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
      .approved(async (transaction: any) => {
        console.log('Transaction approved:', JSON.stringify(transaction));
        const purchaseResult = transaction?.nativePurchase;
        if (!purchaseResult) return;
        console.log('orderId:', purchaseResult.orderId);

        const tokenPacks = this.getTokenPackInfo();
        const packInfo = tokenPacks[purchaseResult.productId];

        // In native mode, verify purchase with backend
        const verificationRequest: TokenPurchaseRequest = {
          purchaseToken: purchaseResult.purchaseToken,
          productId: purchaseResult.productId,
          orderId: purchaseResult.orderId ?? transaction.transactionId, // ✅ Add this line
          tokenAmount: packInfo.tokens,
          price: packInfo.price,
        };

        const result = await this.verifyTokenPurchase(
          verificationRequest
        ).toPromise();

        console.log('Updating token info:', JSON.stringify(result));
        // Update local token info
        this.userService.updateTokenInfo(result!);

        alert(`🎉 Success! You purchased ${packInfo.tokens} tokens`);
        transaction?.finish();
      })
      .verified((receipt: any) => {
        console.log('Receipt verified:', JSON.stringify(receipt));
      })
      .finished((transaction: any) => {
        console.log('Transaction finished:', JSON.stringify(transaction));
        this.refreshUI();
      });
  }

  /**
   * Verify token purchase with Google Play
   */
  verifyTokenPurchase(
    request: TokenPurchaseRequest
  ): Observable<UserTokenInfo> {
    console.log('verifyTokenPurchase request:', JSON.stringify(request));
    return this.http.post<UserTokenInfo>(
      `${this.apiUrl}/verify-token-purchase`,
      request
    );
  }

  refreshUI() {
    console.log('Refreshing UI after product update');
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
    if (!this.isInitialized) {
      throw new Error('Purchase service not initialized');
    }

    if (!this.isNative) {
      // Mock purchase for web
      return this.mockPurchase(productId);
    }

    return new Promise(async (resolve, reject) => {
      const product = this.store.get(productId);
      if (!product) {
        reject(new Error('Product not found'));
        return;
      }
      await product.getOffer().order();
    });
  }

  /**
   * Mock purchase for web development
   */
  private async mockPurchase(productId: string): Promise<PurchaseInfo> {
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

    return result;
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
}
