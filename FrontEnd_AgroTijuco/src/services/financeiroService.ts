import api from './api';
import type { DespesaOperacional, ResumoApuracaoCustos } from '../types';

export const financeiroService = {
  async listarDespesas(propriedadeId: string): Promise<DespesaOperacional[]> {
    const response = await api.get<DespesaOperacional[]>(`/financeiro/propriedade/${propriedadeId}`);
    return response.data;
  },

  async apurarCustos(propriedadeId: string, arrobas: number = 0, litros: number = 0): Promise<ResumoApuracaoCustos> {
    const response = await api.get<ResumoApuracaoCustos>(`/financeiro/propriedade/${propriedadeId}/apuracao?arrobas=${arrobas}&litros=${litros}`);
    return response.data;
  },

  async registrarDespesa(propriedadeId: string, despesa: Partial<DespesaOperacional>): Promise<DespesaOperacional> {
    const response = await api.post<DespesaOperacional>(`/financeiro/propriedade/${propriedadeId}`, despesa);
    return response.data;
  }
};
