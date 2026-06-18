import { getAccessToken } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface PerfilResponse {
    id: string;
    cnpj: string;
    cnae?: string | null;
    uf?: string | null;
    cidade?: string | null;
    palavras_chave: string[];
    notificacoes: boolean;
    user_id?: string | null;
    nome?: string | null;
}

export interface PerfilCreate {
    cnpj: string;
    cnae?: string | null;
    uf?: string | null;
    cidade?: string | null;
    palavras_chave?: string[];
    notificacoes?: boolean;
}

function authHeaders(): Record<string, string> {
    const token = getAccessToken();
    if (!token) throw new Error('Usuário não autenticado');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchMinhaPerfil(): Promise<PerfilResponse | null> {
    const response = await fetch(`${API_BASE_URL}/perfil/me`, {
        headers: authHeaders(),
    });

    if (response.status === 404) return null;

    if (!response.ok) {
        throw new Error(`Erro ao carregar perfil: ${response.status}`);
    }

    return response.json();
}

export async function saveMinhaPerfil(data: PerfilCreate): Promise<PerfilResponse> {
    const response = await fetch(`${API_BASE_URL}/perfil/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as Record<string, unknown>)?.detail as string ?? `Erro ao salvar perfil: ${response.status}`);
    }

    return response.json();
}
