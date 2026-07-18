/**
 * Limiares de frequência usados em todo o app: dashboards, relatórios e PDF.
 * Mantenha as três funções em sincronia — elas classificam a mesma nota.
 *
 * As classes abaixo são escritas por extenso de propósito: o Tailwind varre o
 * código em busca de strings literais, então nomes montados por interpolação
 * (`text-${nivel}`) não geram CSS algum.
 */
export const FREQUENCIA_ADEQUADA = 80;
export const FREQUENCIA_ATENCAO = 60;

type FrequencyLevel = 'success' | 'warning' | 'danger';

/** Classifica um percentual de frequência em um dos três níveis. */
export const getFrequencyVariant = (percentual: number): FrequencyLevel => {
  if (percentual >= FREQUENCIA_ADEQUADA) return 'success';
  if (percentual >= FREQUENCIA_ATENCAO) return 'warning';
  return 'danger';
};

/** Classe de cor de texto para exibir o percentual. */
export const getFrequencyColor = (percentual: number) => {
  if (percentual >= FREQUENCIA_ADEQUADA) return 'text-success';
  if (percentual >= FREQUENCIA_ATENCAO) return 'text-warning';
  return 'text-danger';
};

/** Classes de fundo, texto e borda para o percentual dentro de um Badge. */
export const getFrequencyBadgeClass = (percentual: number) => {
  if (percentual >= FREQUENCIA_ADEQUADA) {
    return 'bg-success-light text-success border-success/30';
  }
  if (percentual >= FREQUENCIA_ATENCAO) {
    return 'bg-warning-light text-warning border-warning/30';
  }
  return 'bg-danger-light text-danger border-danger/30';
};
