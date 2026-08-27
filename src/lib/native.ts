import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Style, StatusBar } from '@capacitor/status-bar';

/**
 * Ajustes que so fazem sentido dentro do app nativo. Na web é um no-op.
 *
 * Chamado apos o primeiro render: o splash fica visivel ate aqui, cobrindo o
 * cold start do bundle.
 */
export const setupNativeShell = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // O cabecalho do app e claro (bg-card), entao o texto da barra precisa ser escuro.
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#F8FAFC' });
    }
    await SplashScreen.hide();
  } catch (erro) {
    // Nenhum destes ajustes e essencial: se falhar, o app continua utilizavel.
    console.error('Falha ao configurar a camada nativa', erro);
  }
};
