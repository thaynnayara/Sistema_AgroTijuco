import { api, TOKEN_KEY, USER_KEY } from './api';
import type { LoginCredentials, AuthResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials, rememberMe: boolean = true): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { token, usuario } = response.data;

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(usuario));

    return response.data;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
};
