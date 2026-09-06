import { api } from './api';
import type { Propriedade, CreatePropriedadeInput } from '../types';

export const propriedadeService = {
  async criarParaProdutor(produtorUuid: string, data: CreatePropriedadeInput): Promise<Propriedade> {
    const response = await api.post<Propriedade>(`/propriedades/produtor/${produtorUuid}`, data);
    return response.data;
  },

  async atribuirProdutor(propriedadeId: string, produtorUuid: string): Promise<Propriedade> {
    const response = await api.put<Propriedade>(`/propriedades/${propriedadeId}/atribuir-produtor/${produtorUuid}`);
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
  },

  async atualizarPropriedade(uuid: string, dados: Partial<Propriedade>): Promise<Propriedade> {
    const response = await api.put<Propriedade>(`/propriedades/${uuid}`, dados);
    return response.data;
  },

  async deletarPropriedade(uuid: string): Promise<void> {
    await api.delete(`/propriedades/${uuid}`);
  }
};
