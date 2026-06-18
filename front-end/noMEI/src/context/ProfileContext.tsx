import React, { createContext, useContext, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileContextValue {
    /** IDs das áreas de interesse selecionadas pelo usuário */
    selectedAreaIds: string[];
    /** Categorias (modalidadeNome) correspondentes às áreas selecionadas */
    selectedCategories: string[];
    /** Labels das áreas selecionadas para match de texto no título da licitação */
    selectedLabels: string[];
    /** CNPJ do MEI logado */
    cnpj: string;
    /** Nome do usuário logado */
    nome: string | null;
    setSelectedAreas: (areaIds: string[], categories: string[], labels: string[]) => void;
    setCnpj: (cnpj: string) => void;
    setNome: (nome: string | null) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ProfileContext = createContext<ProfileContextValue>({
    selectedAreaIds: [],
    selectedCategories: [],
    selectedLabels: [],
    cnpj: '',
    nome: null,
    setSelectedAreas: () => { },
    setCnpj: () => { },
    setNome: () => { },
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProfileProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
    const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [cnpj, setCnpjState] = useState<string>('');
    const [nome, setNomeState] = useState<string | null>(null);

    function setSelectedAreas(areaIds: string[], categories: string[], labels: string[]): void {
        setSelectedAreaIds(areaIds);
        setSelectedCategories(categories);
        setSelectedLabels(labels);
    }

    function setCnpj(value: string): void {
        setCnpjState(value);
    }

    function setNome(value: string | null): void {
        setNomeState(value);
    }

    return (
        <ProfileContext.Provider value={{ selectedAreaIds, selectedCategories, selectedLabels, cnpj, nome, setSelectedAreas, setCnpj, setNome }}>
            {children}
        </ProfileContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProfile(): ProfileContextValue {
    return useContext(ProfileContext);
}
