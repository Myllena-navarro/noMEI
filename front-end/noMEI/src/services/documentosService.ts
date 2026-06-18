import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAccessToken } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function authHeaders(): Record<string, string> {
    const token = getAccessToken();
    if (!token) throw new Error('Usuário não autenticado');
    return { Authorization: `Bearer ${token}` };
}

export type DocumentoStatus = 'pendente' | 'valido' | 'expirado';

export interface Documento {
    id: string;
    cnpj: string;
    nome: string;
    tipo: string;
    tamanho: number;
    status: DocumentoStatus;
    data_upload: string;
}

export interface DocumentoListResponse {
    total: number;
    items: Documento[];
}

export async function uploadDocumento(
    cnpj: string,
    file: { uri: string; name: string; mimeType: string }
): Promise<Documento> {
    const formData = new FormData();
    formData.append('cnpj', cnpj);

    if (Platform.OS === 'web') {
        const blobResponse = await fetch(file.uri);
        const blob = await blobResponse.blob();
        formData.append('file', blob, file.name);
    } else {
        formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
        } as unknown as Blob);
    }

    const response = await fetch(`${API_BASE_URL}/documentos/`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.detail ?? `Erro ao fazer upload: ${response.status}`);
    }

    return response.json();
}

export async function listarDocumentos(): Promise<DocumentoListResponse> {
    const response = await fetch(
        `${API_BASE_URL}/documentos/`,
        { headers: authHeaders() }
    );

    if (!response.ok) {
        throw new Error(`Erro ao listar documentos: ${response.status}`);
    }

    return response.json();
}

export async function abrirDocumento(id: string, nomeArquivo?: string): Promise<void> {
    const url = `${API_BASE_URL}/documentos/${id}/download`;

    if (Platform.OS === 'web') {
        // Web: fetch autenticado → blob URL → nova aba
        const response = await fetch(url, { headers: authHeaders() });
        if (!response.ok) {
            throw new Error(`Erro ao baixar documento: ${response.status}`);
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        return;
    }

    // Nativo: fetch autenticado → base64 → cache local → Sharing
    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok) {
        throw new Error(`Erro ao baixar documento: ${response.status}`);
    }

    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    const fileName = nomeArquivo ?? `documento_${id}.pdf`;
    const localUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(localUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
        await Sharing.shareAsync(localUri);
    } else {
        await Linking.openURL(localUri);
    }
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove o prefixo "data:...;base64,"
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function deletarDocumento(id: string): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/documentos/${id}`,
        {
            method: 'DELETE',
            headers: authHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error(`Erro ao deletar documento: ${response.status}`);
    }
}
