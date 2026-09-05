import { api, TOKEN_KEY, USER_KEY } from './api';
import type { LoginCredentials, AuthResponse, User } from '../types';

export interface RegisterCredentials {
  nome: string;
  email: string;
  senha: string;
  tenantId: string;
  role?: 'GESTOR' | 'ADMIN' | 'PRODUTOR' | 'OPERADOR';
}

function processAuthResponse(data: any, rememberMe: boolean): AuthResponse {
  const token = data.token;
  const user: User = data.usuario || {
    id: data.email,
    nome: data.nome || data.email,
    email: data.email,
    perfil: data.role || 'GESTOR',
    role: data.role || 'GESTOR',
    tenantId: data.tenantId || 'Fazenda AgroTijuco',
    produtorId: data.produtorId,
  };

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));

  return { token, usuario: user };
}

export const authService = {
  async login(credentials: LoginCredentials, rememberMe: boolean = true): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return processAuthResponse(response.data, rememberMe);
  },

  async register(credentials: RegisterCredentials, rememberMe: boolean = true): Promise<AuthResponse> {
    const response = await api.post('/auth/register', {
      ...credentials,
      role: credentials.role || 'GESTOR',
    });
    return processAuthResponse(response.data, rememberMe);
  },

  async cadastrarNovoUsuario(credentials: RegisterCredentials): Promise<any> {
    const response = await api.post('/auth/register', {
      ...credentials,
      role: credentials.role || 'GESTOR',
    });
    return response.data;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
};

