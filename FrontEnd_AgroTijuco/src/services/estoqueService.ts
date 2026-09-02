import api from './api';
import type { ItemEstoque } from '../types';

export const estoqueService = {
  async listarPorPropriedade(propriedadeId: string): Promise<ItemEstoque[]> {
    const response = await api.get<ItemEstoque[]>(`/estoque/propriedade/${propriedadeId}`);
    return response.data;
  },

  async listarAlertas(propriedadeId: string): Promise<ItemEstoque[]> {
    const response = await api.get<ItemEstoque[]>(`/estoque/propriedade/${propriedadeId}/alertas`);
    return response.data;
  },

  async cadastrar(propriedadeId: string, item: Partial<ItemEstoque>): Promise<ItemEstoque> {
    const response = await api.post<ItemEstoque>(`/estoque/propriedade/${propriedadeId}`, item);
    return response.data;
  },

  async movimentar(itemId: string, quantidade: number, entrada: boolean): Promise<ItemEstoque> {
    const response = await api.post<ItemEstoque>(`/estoque/${itemId}/movimentar?quantidade=${quantidade}&entrada=${entrada}`);
    return response.data;
  }
};
