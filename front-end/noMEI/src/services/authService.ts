import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  is_active: boolean;
  nome: string | null;
}

// ─── Error translation ────────────────────────────────────────────────────────

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('not a valid email') || m.includes('@-sign') || m.includes('email')) {
    return 'E-mail inválido';
  }
  if (m.includes('min_length') || m.includes('at least 8') || m.includes('minimum')) {
    return 'Senha deve ter no mínimo 8 caracteres';
  }
  if (m.includes('already') || m.includes('registrado') || m.includes('exists')) {
    return 'E-mail já cadastrado';
  }
  if (m.includes('invalid credentials') || m.includes('incorrect') || m.includes('wrong')) {
    return 'E-mail ou senha incorretos';
  }
  if (m.includes('not found')) {
    return 'Conta não encontrada';
  }
  if (m.includes('expired') || m.includes('invalid token')) {
    return 'Código inválido ou expirado';
  }
  return msg;
}

function parseApiError(data: unknown, fallback: string): string {
  if (typeof data !== 'object' || data === null) return fallback;
  const detail = (data as Record<string, unknown>).detail;
  if (typeof detail === 'string') return translateError(detail);
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === 'object' && first !== null && 'msg' in first) {
      return translateError(String((first as Record<string, unknown>).msg));
    }
  }
  return fallback;
}

// ─── SecureStore keys ─────────────────────────────────────────────────────────

const KEY_ACCESS = 'nomei_access_token';
const KEY_REFRESH = 'nomei_refresh_token';

// ─── In-memory cache (síncrono) + SecureStore (persistente) ──────────────────

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

/**
 * Chame uma vez na inicialização do app (ex: App.tsx) para restaurar a
 * sessão gravada no SecureStore após o app ser fechado.
 */
export async function initAuth(): Promise<void> {
  _accessToken = await SecureStore.getItemAsync(KEY_ACCESS);
  _refreshToken = await SecureStore.getItemAsync(KEY_REFRESH);
}

export async function storeTokens(tokens: TokenResponse): Promise<void> {
  _accessToken = tokens.access_token;
  _refreshToken = tokens.refresh_token;
  await SecureStore.setItemAsync(KEY_ACCESS, tokens.access_token);
  await SecureStore.setItemAsync(KEY_REFRESH, tokens.refresh_token);
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function getRefreshToken(): string | null {
  return _refreshToken;
}

export async function clearTokens(): Promise<void> {
  _accessToken = null;
  _refreshToken = null;
  await SecureStore.deleteItemAsync(KEY_ACCESS);
  await SecureStore.deleteItemAsync(KEY_REFRESH);
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(parseApiError(data, 'E-mail ou senha incorretos'));
  }

  const tokens: TokenResponse = await response.json();
  await storeTokens(tokens);
  return tokens;
}

export async function register(email: string, password: string, nome?: string, lgpd_accepted?: boolean): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nome, lgpd_accepted: lgpd_accepted ?? false }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(parseApiError(data, 'Erro ao criar conta'));
  }

  const tokens: TokenResponse = await response.json();
  storeTokens(tokens);
  return tokens;
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    await clearTokens();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const tokens: TokenResponse = await response.json();
  await storeTokens(tokens);
  return tokens;
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(parseApiError(data, 'Erro ao solicitar recuperação de senha'));
  }
}

export async function resetPassword(token: string, new_password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(parseApiError(data, 'Erro ao redefinir senha'));
  }
}

export async function getMe(): Promise<UserResponse> {
  const token = getAccessToken();
  if (!token) throw new Error('Usuário não autenticado');

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar dados do usuário');
  }

  return response.json();
}
