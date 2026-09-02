import api from './api';
import type { Piquete } from '../types';

export const pastagemService = {
  async listarPorPropriedade(propriedadeId: string): Promise<Piquete[]> {
    const response = await api.get<Piquete[]>(`/pastagens/propriedade/${propriedadeId}`);
    return response.data;
  },

  async cadastrar(propriedadeId: string, piquete: Partial<Piquete>): Promise<Piquete> {
    const response = await api.post<Piquete>(`/pastagens/propriedade/${propriedadeId}`, piquete);
    return response.data;
  }
};
