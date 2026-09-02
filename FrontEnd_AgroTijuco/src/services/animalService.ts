import api from './api';
import type { Animal, BatchAnimalInput } from '../types';
import { offlineSyncService } from './offlineSyncService';

export const animalService = {
  async listarTodos(propriedadeId?: string): Promise<Animal[]> {
    try {
      const url = propriedadeId ? `/animais/propriedade/${propriedadeId}` : '/animais';
      const response = await api.get<Animal[]>(url);
      return response.data;
    } catch (err) {
      if (!navigator.onLine) {
        console.warn('Offline Mode: retornando cache local de animais');
        return [];
      }
      throw err;
    }
  },

  async cadastrar(animal: Partial<Animal>, propriedadeId: string): Promise<Animal> {
    if (!navigator.onLine) {
      offlineSyncService.salvarOperacaoOffline('ANIMAL', `/animais/propriedade/${propriedadeId}`, 'POST', animal);
      return {
        id: 'temp_' + Date.now(),
        brinco: animal.brinco || 'OFFLINE',
        raca: animal.raca || 'Nelore',
        sexo: animal.sexo || 'M',
        status: 'ATIVO',
        emCarenciaSanitaria: false
      };
    }
    const response = await api.post<Animal>(`/animais/propriedade/${propriedadeId}`, animal);
    return response.data;
  },

  async cadastrarEmLote(input: BatchAnimalInput, propriedadeId: string): Promise<Animal[]> {
    const listaAnimais: Partial<Animal>[] = [];
    for (let i = 1; i <= input.quantidade; i++) {
      const numFormatted = i.toString().padStart(3, '0');
      listaAnimais.push({
        brinco: `${input.prefixoBrinco}-${numFormatted}`,
        sexo: input.sexo,
        raca: input.raca,
        lote: input.lote,
        dataNascimento: input.dataNascimento,
        piqueteId: input.piqueteId,
        status: 'ATIVO'
      });
    }

    if (!navigator.onLine) {
      offlineSyncService.salvarOperacaoOffline('ANIMAL', `/animais/propriedade/${propriedadeId}/lote`, 'POST', listaAnimais);
      return listaAnimais as Animal[];
    }

    const response = await api.post<Animal[]>(`/animais/propriedade/${propriedadeId}/lote`, listaAnimais);
    return response.data;
  },

  async atualizarStatus(animalId: string, status: Animal['status']): Promise<Animal> {
    const response = await api.patch<Animal>(`/animais/${animalId}/status?status=${status}`);
    return response.data;
  }
};
