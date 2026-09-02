import api from './api';
import type { EventoReprodutivo } from '../types';

export const reprodutivoService = {
  async listarPorAnimal(animalId: string): Promise<EventoReprodutivo[]> {
    const response = await api.get<EventoReprodutivo[]>(`/reproducao/animal/${animalId}`);
    return response.data;
  },

  async listarAlertas(): Promise<EventoReprodutivo[]> {
    const response = await api.get<EventoReprodutivo[]>('/reproducao/alertas');
    return response.data;
  },

  async registrar(animalId: string, evento: { tipo: string; dataEvento: string; observacao?: string }): Promise<EventoReprodutivo> {
    const response = await api.post<EventoReprodutivo>(`/reproducao/animal/${animalId}`, evento);
    return response.data;
  }
};
