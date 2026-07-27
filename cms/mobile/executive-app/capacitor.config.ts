import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cms.executive',
  appName: 'CMS Executive',
  // Both native shells load the SAME Angular build output — no separate
  // frontend code, just a different branded wrapper around it.
  webDir: '../../frontend/dist/cms-frontend/browser',
  server: {
    // Uncomment for live-reload against your dev machine during development:
    // url: 'http://192.168.1.50:4200',
    // cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
