import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cms.vendor',
  appName: 'CMS Vendor',
  webDir: '../../frontend/dist/cms-frontend/browser',
  server: {
    // url: 'http://192.168.1.50:4200',
    // cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
