import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Trata o botao fisico de voltar do Android.
 *
 * Sem isto o comportamento padrao esvazia o historico do WebView e fecha o app,
 * mesmo com o menu lateral aberto — bem pouco idiomatico no Android.
 *
 * @param onBack Recebe o estado de navegacao e devolve `true` se ja tratou o
 *               evento (por exemplo, fechando um painel). Devolvendo `false`,
 *               o padrao segue: volta uma pagina ou sai do app na raiz.
 */
export const useBackButton = (onBack: () => boolean) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handle = App.addListener('backButton', ({ canGoBack }) => {
      if (onBack()) return;
      if (canGoBack) {
        window.history.back();
      } else {
        void App.exitApp();
      }
    });

    return () => {
      void handle.then(listener => listener.remove());
    };
  }, [onBack]);
};
