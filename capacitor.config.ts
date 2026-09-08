// @ts-ignore
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.haqplus.app',
  appName: 'HaqPlus',
  webDir: 'public',
  server: {
    url: 'https://haqplus.com',
    cleartext: true
  }
};

export default config;
