/** Máscara de CPF/CNPJ. O estado guarda só os dígitos; a máscara é puramente de exibição. */
export type DocumentType = 'Cpf' | 'Cnpj';

export const DOCUMENT_DIGIT_LENGTH: Record<DocumentType, number> = {
  Cpf: 11,
  Cnpj: 14,
};

export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

const formatCpf = (digits: string): string => {
  let out = digits.slice(0, 3);
  if (digits.length > 3) out += `.${digits.slice(3, 6)}`;
  if (digits.length > 6) out += `.${digits.slice(6, 9)}`;
  if (digits.length > 9) out += `-${digits.slice(9, 11)}`;
  return out;
};

const formatCnpj = (digits: string): string => {
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += `.${digits.slice(2, 5)}`;
  if (digits.length > 5) out += `.${digits.slice(5, 8)}`;
  if (digits.length > 8) out += `/${digits.slice(8, 12)}`;
  if (digits.length > 12) out += `-${digits.slice(12, 14)}`;
  return out;
};

/** Recebe os dígitos crus (já truncados no tamanho do tipo) e devolve com pontuação. */
export const formatDocumentNumber = (digits: string, type: DocumentType): string => {
  const truncated = digits.slice(0, DOCUMENT_DIGIT_LENGTH[type]);
  return type === 'Cpf' ? formatCpf(truncated) : formatCnpj(truncated);
};
