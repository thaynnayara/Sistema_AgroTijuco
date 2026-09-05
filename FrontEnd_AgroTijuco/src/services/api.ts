import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Resolução dinâmica e segura da URL base da API
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const protocol = window.location.protocol || 'http:';
    const host = window.location.hostname;
    return `${protocol}//${host}:8080`;
  }
  return 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();

export const TOKEN_KEY = '@AgroTijuco:token';
export const USER_KEY = '@AgroTijuco:user';

// Desabilita withXSRFToken globalmente no Axios para evitar a chamada interna a isURLSameOrigin(url)
// que tenta instanciar `new URL(url, platform.origin)` e causa "TypeError: Failed to construct 'URL': Invalid URL"
axios.defaults.withXSRFToken = false;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withXSRFToken: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.withXSRFToken = false;

    if (config.url && typeof config.url === 'string') {
      if (!config.url.startsWith('http://') && !config.url.startsWith('https://')) {
        if (!config.url.startsWith('/')) {
          config.url = '/' + config.url;
        }
      }
    }

    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    let tenantId = 'Fazenda AgroTijuco';
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.tenantId) tenantId = user.tenantId;
      } catch (e) {
        // ignore JSON parse errors
      }
    }

    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (!config.headers['X-Tenant-ID'] && (!config.url || !config.url.includes('/auth/login'))) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
