import api from './api';
import type { DietaTrato } from '../types';

export const nutricaoService = {
  async listarPorPropriedade(propriedadeId: string): Promise<DietaTrato[]> {
    const response = await api.get<DietaTrato[]>(`/nutricao/propriedade/${propriedadeId}`);
    return response.data;
  },

  async registrar(propriedadeId: string, dieta: Partial<DietaTrato>): Promise<DietaTrato> {
    const response = await api.post<DietaTrato>(`/nutricao/propriedade/${propriedadeId}`, dieta);
    return response.data;
  }
};
