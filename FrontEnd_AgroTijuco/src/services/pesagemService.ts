import api from './api';
import type { Pesagem } from '../types';
import { offlineSyncService } from './offlineSyncService';

export const pesagemService = {
  async listarTodas(animalId?: string): Promise<Pesagem[]> {
    try {
      const url = animalId ? `/pesagens/animal/${animalId}` : '/pesagens';
      const response = await api.get<Pesagem[]>(url);
      return response.data;
    } catch (err) {
      if (!navigator.onLine) {
        return [];
      }
      throw err;
    }
  },

  async registrar(pesagem: { dataPesagem: string; pesoKg: number; observacao?: string }, animalId: string): Promise<Pesagem> {
    if (!navigator.onLine) {
      offlineSyncService.salvarOperacaoOffline('PESAGEM', `/pesagens/animal/${animalId}`, 'POST', pesagem);
      return {
        id: 'temp_pes_' + Date.now(),
        animalId,
        dataPesagem: pesagem.dataPesagem,
        pesoKg: pesagem.pesoKg,
        gmdKgDia: 0,
        observacao: pesagem.observacao + ' (Salvo Offline)'
      };
    }
    const response = await api.post<Pesagem>(`/pesagens/animal/${animalId}`, pesagem);
    return response.data;
  }
};
