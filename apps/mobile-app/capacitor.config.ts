import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'mobile-app',
  webDir: '../../dist/apps/mobile-app/browser',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http', // Without https for local testing
    cleartext: true, // Allow cleartext traffic for local testing
  },
};

export default config;
