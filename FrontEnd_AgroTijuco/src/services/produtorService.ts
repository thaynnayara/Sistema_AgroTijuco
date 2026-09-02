import { api } from './api';
import type { Produtor, CreateProdutorInput } from '../types';

export const produtorService = {
  async criar(data: CreateProdutorInput): Promise<{ id: string } & Produtor> {
    const response = await api.post<{ id: string } & Produtor>('/produtores', data);
    return response.data;
  },

  async listar(): Promise<Produtor[]> {
    const response = await api.get<Produtor[]>('/produtores');
    return response.data;
  },

  async obterPorId(uuid: string): Promise<Produtor> {
    const response = await api.get<Produtor>(`/produtores/${uuid}`);
    return response.data;
  },

  async atualizar(uuid: string, data: Partial<CreateProdutorInput>): Promise<Produtor> {
    const response = await api.put<Produtor>(`/produtores/${uuid}`, data);
    return response.data;
  },

  async deletar(uuid: string): Promise<void> {
    await api.delete(`/produtores/${uuid}`);
  }
};
