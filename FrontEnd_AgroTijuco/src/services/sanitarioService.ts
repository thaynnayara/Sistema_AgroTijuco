import api from './api';
import type { RegistroSanitario } from '../types';

export const sanitarioService = {
  async listarPorAnimal(animalId: string): Promise<RegistroSanitario[]> {
    const response = await api.get<RegistroSanitario[]>(`/sanidade/animal/${animalId}`);
    return response.data;
  },

  async listarCarenciasAtivas(): Promise<RegistroSanitario[]> {
    const response = await api.get<RegistroSanitario[]>('/sanidade/carencias');
    return response.data;
  },

  async registrar(registro: Partial<RegistroSanitario>): Promise<RegistroSanitario> {
    const response = await api.post<RegistroSanitario>('/sanidade', registro);
    return response.data;
  }
};
