# Android Hardware Back Button Fix

## Problem

The Android hardware back button was closing the entire app instead of navigating to the previous page/route within the app.

## Solution

Implemented hardware back button handling using Capacitor's App plugin with intelligent navigation logic.

## Implementation Details

### 1. Installed Capacitor App Plugin

```bash
npm install @capacitor/app@6.0.0 --force
```

### 2. Created Navigation Service

- **File**: `src/app/services/navigation.service.ts`
- **Purpose**: Centralized navigation logic with history tracking
- **Features**:
  - Tracks navigation history (last 10 routes)
  - Prevents rapid back button presses (500ms threshold)
  - Intelligent routing based on current page
  - Clear history on logout

### 3. Updated App Component

- **File**: `src/app/app.component.ts`
- **Changes**:
  - Added Capacitor App and Core imports
  - Implemented `initializeBackButtonHandling()` method
  - Added Android platform detection
  - Integrated NavigationService

### 4. Navigation Logic

The back button navigation follows this priority:

1. **Exit Routes**: `/today`, `/login`, `/register` → Exit app
2. **Specific Route Patterns**:
   - `/habit/{id}` → Navigate to `/habits`
   - `/edit-habit/{id}` → Navigate to `/habits`
   - `/profile/{id}` → Navigate to `/connections`
3. **Mapped Routes**:
   - `/habits` → `/today`
   - `/explore` → `/today`
   - `/connections` → `/today`
   - `/notifications` → `/today`
   - `/myprofile` → `/today`
   - `/add-habit` → `/today`
   - `/stats` → `/myprofile`
   - `/archived-habits` → `/myprofile`
4. **Navigation History**: Use tracked history if available
5. **Fallback**: Navigate to `/today`

### 5. Capacitor Sync

```bash
npx cap sync
npx cap copy
```

## How It Works

1. When the user presses the hardware back button on Android, the Capacitor App plugin fires a `backButton` event
2. The event is caught by `initializeBackButtonHandling()` in AppComponent
3. The NavigationService determines the appropriate navigation action based on:
   - Current route
   - Navigation history
   - Predefined navigation mapping
4. Either navigates to a specific route or exits the app

## Benefits

- ✅ Natural back button behavior for users
- ✅ Prevents accidental app exits
- ✅ Logical navigation flow
- ✅ History tracking for better UX
- ✅ Prevents rapid back button presses
- ✅ Platform-specific (only applies to Android)

## Testing

To test the fix:

1. Build the app: `npm run build`
2. Copy to Android: `npx cap copy`
3. Open in Android Studio: `npx cap open android`
4. Run on Android device/emulator
5. Navigate through different pages and test hardware back button

## Notes

- Only works on Android devices (automatically detected)
- Uses Capacitor 6.0.0 compatible App plugin
- Navigation history is limited to 10 entries to prevent memory issues
- Back button presses are throttled to 500ms to prevent double-taps
