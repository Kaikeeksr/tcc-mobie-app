import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.tcc.kaike.rocha.gestaochamadas',
  appName: 'Gestão de Chamadas',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      // Escondido manualmente em src/lib/native.ts, apos o primeiro render.
      launchAutoHide: false,
      backgroundColor: '#F8FAFC',
    },
  },
};

export default config;
