import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Propriedade, CreatePropriedadeInput } from '../types';
import { propriedadeService } from '../services/propriedadeService';

const SELECTED_FARM_KEY = '@AgroTijuco:selectedFarmId';
const FARMS_CACHE_KEY = '@AgroTijuco:farmsCache';

export const FAZENDAS_PADRAO: Propriedade[] = [];

interface FarmContextData {
  propriedades: Propriedade[];
  selectedFarm: Propriedade | null;
  setSelectedFarm: (farm: Propriedade | null) => void;
  selectFarmById: (id: string) => void;
  atualizarFazenda: (id: string, dados: Partial<Propriedade>) => Promise<Propriedade>;
  cadastrarFazenda: (dados: CreatePropriedadeInput, produtorId?: string) => Promise<Propriedade>;
  recarregarFazendas: () => Promise<void>;
  loadingFarms: boolean;
}

const FarmContext = createContext<FarmContextData>({} as FarmContextData);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [propriedades, setPropriedades] = useState<Propriedade[]>(() => {
    const cached = localStorage.getItem(FARMS_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          // Purga resquícios de mocks antigos de Walter Barreto
          return parsed.filter((p: Propriedade) => 
            !p.produtorNome?.includes('Walter Barreto')
          );
        }
      } catch {}
    }
    return [];
  });

  const [selectedFarm, setSelectedFarmState] = useState<Propriedade | null>(null);
  const [loadingFarms, setLoadingFarms] = useState<boolean>(false);

  const setSelectedFarm = (farm: Propriedade | null) => {
    setSelectedFarmState(farm);
    if (farm?.id) {
      localStorage.setItem(SELECTED_FARM_KEY, farm.id);
    } else {
      localStorage.removeItem(SELECTED_FARM_KEY);
    }
  };

  const selectFarmById = useCallback(
    (id: string) => {
      const found = propriedades.find((p) => p.id === id);
      if (found) {
        setSelectedFarm(found);
      }
    },
    [propriedades]
  );

  const carregarFazendas = useCallback(async () => {
    setLoadingFarms(true);
    try {
      const data = await propriedadeService.listarTodas();
      if (Array.isArray(data)) {
        const formatadas = data.map((p) => ({
          ...p,
          nome: p.nomeFazenda || p.nome || 'Fazenda sem nome',
          localizacao: p.municipio || p.localizacao || 'Localização não informada',
        }));
        setPropriedades(formatadas);
        localStorage.setItem(FARMS_CACHE_KEY, JSON.stringify(formatadas));

        // Preserva seleção anterior ou seleciona a primeira se houver
        const savedId = localStorage.getItem(SELECTED_FARM_KEY);
        const target = (savedId && formatadas.find((f) => f.id === savedId)) || formatadas[0] || null;
        setSelectedFarmState(target);
        return;
      }
    } catch {
      // Ignora erro de rede e usa cache
    } finally {
      setLoadingFarms(false);
    }

    // Fallback apenas para cache local real e limpo
    const cached = localStorage.getItem(FARMS_CACHE_KEY);
    let farms: Propriedade[] = [];
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          farms = parsed.filter((p: Propriedade) => 
            !p.produtorNome?.includes('Walter Barreto')
          );
        }
      } catch {}
    }
    setPropriedades(farms);
    const savedId = localStorage.getItem(SELECTED_FARM_KEY);
    const target = (savedId && farms.find((f) => f.id === savedId)) || farms[0] || null;
    setSelectedFarmState(target);
  }, []);

  useEffect(() => {
    carregarFazendas();
  }, [carregarFazendas]);

  const atualizarFazenda = async (id: string, dados: Partial<Propriedade>): Promise<Propriedade> => {
    try {
      await propriedadeService.atualizarPropriedade(id, dados);
    } catch (e) {
      console.warn('Erro ao atualizar fazenda no backend, salvando no estado local:', e);
    }

    const atualizadas = propriedades.map((p) => {
      if (p.id === id) {
        const nova = {
          ...p,
          ...dados,
          nome: dados.nome || dados.nomeFazenda || p.nome,
          nomeFazenda: dados.nomeFazenda || dados.nome || p.nomeFazenda,
          municipio: dados.municipio || dados.localizacao || p.municipio,
          localizacao: dados.localizacao || dados.municipio || p.localizacao,
        };
        return nova;
      }
      return p;
    });

    setPropriedades(atualizadas);
    localStorage.setItem(FARMS_CACHE_KEY, JSON.stringify(atualizadas));

    const alterada = atualizadas.find((p) => p.id === id)!;
    if (selectedFarm?.id === id) {
      setSelectedFarmState(alterada);
    }
    return alterada;
  };

  const cadastrarFazenda = async (
    dados: CreatePropriedadeInput,
    produtorId?: string
  ): Promise<Propriedade> => {
    let criada: Propriedade;
    try {
      criada = await propriedadeService.criarParaProdutor(produtorId, dados);
    } catch {
      criada = {
        ...dados,
        id: crypto.randomUUID ? crypto.randomUUID() : `prop-${Date.now()}`,
        nome: dados.nome,
        nomeFazenda: dados.nome,
        municipio: dados.localizacao,
        localizacao: dados.localizacao,
        produtorId: produtorId || undefined,
      };
    }

    const formatada: Propriedade = {
      ...criada,
      id: criada.id || `prop-${Date.now()}`,
      nome: criada.nomeFazenda || criada.nome || dados.nome,
      nomeFazenda: criada.nomeFazenda || dados.nome,
      municipio: criada.municipio || dados.localizacao,
      localizacao: criada.localizacao || dados.localizacao,
      produtorId: produtorId || criada.produtorId,
    };

    const lista = [formatada, ...propriedades];
    setPropriedades(lista);
    localStorage.setItem(FARMS_CACHE_KEY, JSON.stringify(lista));
    setSelectedFarm(formatada);
    return formatada;
  };

  return (
    <FarmContext.Provider
      value={{
        propriedades,
        selectedFarm,
        setSelectedFarm,
        selectFarmById,
        atualizarFazenda,
        cadastrarFazenda,
        recarregarFazendas: carregarFazendas,
        loadingFarms,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm deve ser usado dentro de um FarmProvider');
  }
  return context;
}
