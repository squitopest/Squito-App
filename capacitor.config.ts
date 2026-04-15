import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: 'com.squito.app',
  appName: 'Squito AI',
  webDir: 'out',
  server: {
    // Allows loading local video/image assets
    androidScheme: 'https',
    iosScheme: 'capacitor',
    allowNavigation: [
      '*.supabase.co',
      '*.cloudflarestream.com',
      '*.stripe.com',
    ],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 300,
      backgroundColor: '#0a0a0a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0a',
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
    backgroundColor: '#0a0a0a',
  },
};

export default config;
