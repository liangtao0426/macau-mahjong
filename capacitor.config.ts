import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mahjong.score',
  appName: '麻雀记',
  webDir: 'dist',
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'LIGHT',
      initialViewportFitValueHint: 'cover'
    }
  }
};

export default config;
