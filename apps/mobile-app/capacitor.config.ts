import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'mobile-app',
  webDir: '../../dist/apps/mobile-app/browser',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
};

export default config;
