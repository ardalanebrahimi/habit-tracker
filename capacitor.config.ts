import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ardiland.habittracker',
  appName: 'habit-tracker',
  webDir: 'dist/habit-tracker/browser',
  plugins: {
    App: {
      launchShowDuration: 0,
    },
  },
  android: {
    allowMixedContent: true,
    useLegacyBridge: false,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
