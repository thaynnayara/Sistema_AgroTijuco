import { api } from './api';
import type { Propriedade, CreatePropriedadeInput } from '../types';

export const propriedadeService = {
  async criarParaProdutor(produtorUuid: string, data: CreatePropriedadeInput): Promise<Propriedade> {
    const response = await api.post<Propriedade>(`/propriedades/produtor/${produtorUuid}`, data);
    return response.data;
  },

  async listarPorProdutor(produtorUuid: string): Promise<Propriedade[]> {
    const response = await api.get<Propriedade[]>(`/propriedades/produtor/${produtorUuid}`);
    return response.data;
  },

  async listarTodas(): Promise<Propriedade[]> {
    const response = await api.get<Propriedade[]>('/propriedades');
    return response.data;
  },

  async obterPorId(uuid: string): Promise<Propriedade> {
    const response = await api.get<Propriedade>(`/propriedades/${uuid}`);
    return response.data;
  }
};
