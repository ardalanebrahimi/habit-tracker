# Google Play Billing Setup Guide

## Overview

This guide explains how to implement real Google Play Billing in your habit tracker app instead of the mocked version.

## What We've Implemented

### 1. Frontend Changes

- **GooglePlayBillingService**: A comprehensive service that handles all Google Play Billing operations
- **Updated BillingService**: Now uses the real Google Play Billing service instead of mocks
- **Capacitor Plugin Interface**: Connects Angular to native Android code

### 2. Android Native Code

- **CapacitorGooglePlayBillingPlugin.java**: Native Android plugin for Google Play Billing
- **MainActivity.java**: Updated to register the billing plugin
- **build.gradle**: Added Google Play Billing library dependency

## Setup Steps

### Step 1: Google Play Console Setup

1. **Create a Google Play Developer Account** (if you don't have one)

   - Go to https://play.google.com/console
   - Pay the $25 one-time registration fee

2. **Create Your App in Google Play Console**

   - Upload a signed APK/AAB
   - Fill out the app information
   - Set up your app's store listing

3. **Set Up In-App Products**

   - Go to "Monetization" > "Products" > "In-app products"
   - Create the following products:

   **Token Packs (Consumable Products):**

   - Product ID: `tokens_10` - Price: $0.99 - Title: "10 Tokens"
   - Product ID: `tokens_25` - Price: $1.99 - Title: "25 Tokens"
   - Product ID: `tokens_50` - Price: $3.99 - Title: "50 Tokens"
   - Product ID: `tokens_100` - Price: $6.99 - Title: "100 Tokens"

   **Subscriptions:**

   - Go to "Monetization" > "Products" > "Subscriptions"
   - Product ID: `premium_monthly` - Price: $2.99/month - Title: "Premium Monthly"
   - Product ID: `premium_yearly` - Price: $9.99/year - Title: "Premium Yearly"

4. **Set Up Testers**
   - Add test accounts in "Testing" > "License testing"
   - Add email addresses that can test purchases without being charged

### Step 2: Android App Signing

1. **Generate a signed APK/AAB**

   ```bash
   # Build the Android app
   npm run build
   npx cap copy android
   npx cap open android
   ```

2. **In Android Studio:**

   - Build > Generate Signed Bundle/APK
   - Create a new keystore (keep it safe!)
   - Generate the signed APK/AAB

3. **Upload to Google Play Console**
   - Upload the signed APK/AAB to Internal Testing
   - This enables Google Play Billing for your app

### Step 3: Testing

1. **Install the app from Google Play Console**

   - Use Internal Testing to install the app
   - Don't install via Android Studio - billing won't work

2. **Test Purchases**
   - Use test accounts you set up in Google Play Console
   - Test purchases will show "Test" in the purchase dialog
   - Test accounts won't be charged real money

### Step 4: Backend Configuration

The backend is already configured to handle:

- Token purchase verification
- Subscription verification
- Purchase validation with Google Play

Make sure your backend endpoints are accessible:

- `POST /api/payments/verify-token-purchase`
- `POST /api/payments/verify-subscription`
- `POST /api/payments/cancel-subscription`
- `POST /api/payments/restore-purchases`

## Current Implementation Status

✅ **Completed:**

- Google Play Billing service implementation
- Native Android plugin
- Frontend integration
- Purchase flow handling
- Token consumption
- Subscription management
- Web simulation for development

✅ **Ready for Testing:**

- Token purchases (consumable)
- Premium subscriptions
- Purchase verification
- Error handling

## How It Works

### Development Mode (Web/Browser)

- Shows confirmation dialogs
- Simulates purchases
- Updates token balances
- Good for development/testing

### Production Mode (Android Device)

- Connects to Google Play Billing
- Shows real Google Play purchase dialogs
- Processes real payments (in test mode for testers)
- Verifies purchases with Google Play servers

## Testing the Implementation

### In Development (Browser):

```bash
npm start
# Navigate to subscription management
# Click "Buy Tokens" or "Subscribe"
# You'll see confirmation dialogs (simulated)
```

### On Android Device:

```bash
# Build and deploy to device
npm run build:android
# Open in Android Studio and run on device
# Make sure device has Google Play Store
# Make sure you're using a test account
```

## Product IDs Configuration

The app is configured to use these product IDs:

**Token Packs:**

- `tokens_10`: 10 tokens for $0.99
- `tokens_25`: 25 tokens for $1.99
- `tokens_50`: 50 tokens for $3.99
- `tokens_100`: 100 tokens for $6.99

**Subscriptions:**

- `premium_monthly`: Monthly premium for $2.99
- `premium_yearly`: Yearly premium for $9.99

Make sure these exact IDs are used in Google Play Console.

## Next Steps

1. **Set up Google Play Console** (most important!)
2. **Create and upload signed APK**
3. **Configure in-app products**
4. **Test with test accounts**
5. **Submit for review when ready**

## Troubleshooting

**"Item not available for purchase":**

- Product IDs don't match Google Play Console
- App not uploaded to Google Play Console
- Products not activated in Console

**"Authentication required":**

- Device doesn't have Google Play Store
- Not using the same Google account as in test accounts
- App not installed from Google Play Console

**"This version of the app is not configured for billing":**

- App not uploaded to Google Play Console
- Using wrong package name
- App not signed with release key

## Files Modified

### Frontend:

- `src/app/services/google-play-billing.service.ts` (new)
- `src/app/services/google-play-billing.native.ts` (new)
- `src/app/services/billing.service.ts` (updated)

### Android:

- `android/app/src/main/java/com/ardiland/habittracker/CapacitorGooglePlayBillingPlugin.java` (new)
- `android/app/src/main/java/com/ardiland/habittracker/MainActivity.java` (updated)
- `android/app/build.gradle` (updated)

The implementation is now ready for real Google Play Billing! The most important step is setting up the Google Play Console and creating the in-app products.
