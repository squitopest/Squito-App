import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: 'com.squito.app',
  appName: 'Squito AI',
  webDir: 'out',
  server: {
    // Allows loading local video/image assets
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#f9fafb',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#f9fafb',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
    backgroundColor: '#f9fafb',
  },
};

export default config;
