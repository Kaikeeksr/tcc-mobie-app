/**
 * Camada HTTP única do app: injeta o Bearer token, traduz ProblemDetails (RFC
 * 9457) do backend numa exceção tipada e concentra a URL base. Os services em
 * src/services/ são o único lugar que a importa.
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5218';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorCode: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

/** Chamado quando qualquer requisição volta 401 — o AuthContext usa isso para encerrar a sessão. */
export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  onUnauthorized = handler;
};

interface ProblemDetailsBody {
  title?: string;
  detail?: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
}

const buildQuery = (params?: Record<string, string | number | boolean | undefined | null>): string => {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `?${search.toString()}`;
};

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : undefined;

  if (!response.ok) {
    if (response.status === 401) {
      onUnauthorized?.();
    }

    const problem = data as ProblemDetailsBody | undefined;
    const firstFieldError = problem?.errors ? Object.values(problem.errors)[0]?.[0] : undefined;
    const message = firstFieldError ?? problem?.detail ?? problem?.title ?? 'Erro inesperado. Tente novamente.';

    throw new ApiError(response.status, problem?.errorCode ?? 'Unknown', message);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined | null>) =>
    request<T>('GET', `${path}${buildQuery(params)}`),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
