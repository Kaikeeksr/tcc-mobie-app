import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Retorno tatil. No navegador vira no-op, e qualquer falha e engolida: vibrar
 * e um detalhe de acabamento e nunca deve derrubar a acao do usuario.
 */
const disponivel = () => Capacitor.isNativePlatform();

/** Toque curto — confirma um item marcado numa lista. */
export const hapticSelecao = async () => {
  if (!disponivel()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* sem vibracao neste aparelho */
  }
};

/** Padrao de sucesso — conclusao de uma acao, como salvar a chamada. */
export const hapticSucesso = async () => {
  if (!disponivel()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* sem vibracao neste aparelho */
  }
};
