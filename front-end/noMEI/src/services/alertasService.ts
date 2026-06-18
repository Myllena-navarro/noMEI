import { getAccessToken } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertaType = 'new_bid' | 'deadline' | 'status_change' | 'document';

export interface Alerta {
  id: string;
  type: AlertaType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  contratacao_id?: string | null;
}

export interface AlertaListResponse {
  total: number;
  items: Alerta[];
}

// ─── API call ─────────────────────────────────────────────────────────────────

export async function fetchAlertas(): Promise<AlertaListResponse> {
  const token = getAccessToken();
  if (!token) throw new Error('Usuário não autenticado');

  const response = await fetch(`${API_BASE_URL}/alertas/`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar notificações');
  }

  return response.json() as Promise<AlertaListResponse>;
}

/**
 * PATCH /api/v1/alertas/{id}/read
 * Marca um alerta individual como lido.
 */
export async function markAlertaRead(id: string): Promise<void> {
  const token = getAccessToken();
  if (!token) throw new Error('Usuário não autenticado');

  const response = await fetch(`${API_BASE_URL}/alertas/${id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Erro ao marcar alerta como lido: ${response.status}`);
  }
}

/**
 * Marca múltiplos alertas como lidos em paralelo.
 * Substitua por PATCH /alertas/read-all quando o endpoint existir no back-end.
 */
export async function markAllAlertasRead(ids: string[]): Promise<void> {
  await Promise.all(ids.map(markAlertaRead));
}

