import { Capacitor } from '@capacitor/core';

export interface CapacitorGooglePlayBillingPlugin {
  startConnection(): Promise<{ responseCode: number; debugMessage?: string }>;
  endConnection(): Promise<void>;
  querySkuDetails(options: {
    skuList: string[];
    skuType: 'inapp' | 'subs';
  }): Promise<{
    responseCode: number;
    skuDetailsList?: Array<{
      productId: string;
      type: 'inapp' | 'subs';
      price: string;
      priceAmountMicros: number;
      priceCurrencyCode: string;
      title: string;
      description: string;
    }>;
  }>;
  launchBillingFlow(options: {
    sku: string;
    skuType: 'inapp' | 'subs';
  }): Promise<{
    responseCode: number;
    debugMessage?: string;
    purchasesList?: Array<{
      orderId: string;
      packageName: string;
      productId: string;
      purchaseTime: number;
      purchaseState: number;
      purchaseToken: string;
      autoRenewing?: boolean;
      acknowledged: boolean;
    }>;
  }>;
  queryPurchases(options: { skuType: 'inapp' | 'subs' }): Promise<{
    responseCode: number;
    purchasesList?: Array<{
      orderId: string;
      packageName: string;
      productId: string;
      purchaseTime: number;
      purchaseState: number;
      purchaseToken: string;
      autoRenewing?: boolean;
      acknowledged: boolean;
    }>;
  }>;
  acknowledgePurchase(options: {
    purchaseToken: string;
  }): Promise<{ responseCode: number }>;
  consumePurchase(options: {
    purchaseToken: string;
  }): Promise<{ responseCode: number }>;
}

// Create a direct plugin interface using window object
declare global {
  interface Window {
    CapacitorGooglePlayBilling?: CapacitorGooglePlayBillingPlugin;
  }
}

const CapacitorGooglePlayBilling: CapacitorGooglePlayBillingPlugin = {
  async startConnection() {
    if (Capacitor.isNativePlatform() && window.CapacitorGooglePlayBilling) {
      try {
        return await window.CapacitorGooglePlayBilling.startConnection();
      } catch (error) {
        console.error('Native billing startConnection failed:', error);
        return { responseCode: -1, debugMessage: 'Plugin not available' };
      }
    }
    return { responseCode: 0 };
  },

  async endConnection() {
    if (Capacitor.isNativePlatform() && window.CapacitorGooglePlayBilling) {
      try {
        return await window.CapacitorGooglePlayBilling.endConnection();
      } catch (error) {
        console.error('Native billing endConnection failed:', error);
      }
    }
    return Promise.resolve();
  },

  async querySkuDetails(options) {
    if (Capacitor.isNativePlatform() && window.CapacitorGooglePlayBilling) {
      try {
        return await window.CapacitorGooglePlayBilling.querySkuDetails(options);
      } catch (error) {
        console.error('Native billing querySkuDetails failed:', error);
        return { responseCode: -1, skuDetailsList: [] };
      }
    }
    return { responseCode: 0, skuDetailsList: [] };
  },

  async launchBillingFlow(options) {
    if (Capacitor.isNativePlatform() && window.CapacitorGooglePlayBilling) {
      try {
        return await window.CapacitorGooglePlayBilling.launchBillingFlow(
          options
        );
      } catch (error) {
        console.error('Native billing launchBillingFlow failed:', error);
        return { responseCode: -1, debugMessage: 'Plugin not available' };
      }
    }
    return { responseCode: 1 }; // User canceled for web
  },

  async queryPurchases(options) {
    if (Capacitor.isNativePlatform() && window.CapacitorGooglePlayBilling) {
      try {
        return await window.CapacitorGooglePlayBilling.queryPurchases(options);
      } catch (error) {
        console.error('Native billing queryPurchases failed:', error);
        return { responseCode: -1, purchasesList: [] };
      }
    }
    return { responseCode: 0, purchasesList: [] };
  },

  async acknowledgePurchase(options) {
    if (Capacitor.isNativePlatform() && window.CapacitorGooglePlayBilling) {
      try {
        return await window.CapacitorGooglePlayBilling.acknowledgePurchase(
          options
        );
      } catch (error) {
        console.error('Native billing acknowledgePurchase failed:', error);
        return { responseCode: -1 };
      }
    }
    return { responseCode: 0 };
  },

  async consumePurchase(options) {
    if (Capacitor.isNativePlatform() && window.CapacitorGooglePlayBilling) {
      try {
        return await window.CapacitorGooglePlayBilling.consumePurchase(options);
      } catch (error) {
        console.error('Native billing consumePurchase failed:', error);
        return { responseCode: -1 };
      }
    }
    return { responseCode: 0 };
  },
};

export { CapacitorGooglePlayBilling };
