import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginCredentials } from '../types';
import { authService, type RegisterCredentials } from '../services/authService';
import { TOKEN_KEY, USER_KEY } from '../services/api';

const TECH_VIEW_KEY = '@AgroTijuco:techView';

export const MOCK_ADMIN: User = {
  id: 'f5e95a07-bc6e-4cd0-aecd-96b92883e932',
  nome: 'Thaynná Yara',
  email: 'thaynna.yara@agrotijuco.com.br',
  perfil: 'ADMIN',
  role: 'ADMIN',
  tenantId: 'Fazenda AgroTijuco',
  ativo: true,
};

export const MOCK_GESTOR: User = {
  id: 'usr-thaynna-yara-gestora',
  nome: 'Thaynná Yara',
  email: 'thaynna.gestora@agrotijuco.com.br',
  perfil: 'GESTOR',
  role: 'GESTOR',
  tenantId: 'Fazenda AgroTijuco',
  ativo: true,
};

export const MOCK_PRODUTOR: User = {
  id: 'usr-walter-barreto-produtor',
  nome: 'Walter Barreto',
  email: 'walter.barreto@fazenda.com.br',
  perfil: 'PRODUTOR',
  role: 'PRODUTOR',
  tenantId: 'Fazenda AgroTijuco',
  produtorId: '9b1deb4d-3b7d-4149-9cd6-890000000001',
  produtorNome: 'Walter Barreto',
  ativo: true,
};

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isGestor: boolean;
  isProdutor: boolean;
  showTechnicalDetails: boolean;
  setShowTechnicalDetails: (value: boolean) => void;
  toggleTechnicalDetails: () => void;
  login: (credentials: LoginCredentials, rememberMe?: boolean) => Promise<void>;
  register: (credentials: RegisterCredentials, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  setMockAuth: (user: User, token: string) => void;
  switchUserRole: (role: 'ADMIN' | 'GESTOR' | 'PRODUTOR') => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetailsState] = useState<boolean>(() => {
    return localStorage.getItem(TECH_VIEW_KEY) === 'true';
  });

  const setShowTechnicalDetails = (value: boolean) => {
    setShowTechnicalDetailsState(value);
    localStorage.setItem(TECH_VIEW_KEY, String(value));
  };

  const toggleTechnicalDetails = () => {
    setShowTechnicalDetailsState((prev) => {
      const next = !prev;
      localStorage.setItem(TECH_VIEW_KEY, String(next));
      return next;
    });
  };

  useEffect(() => {
    function loadStorageData() {
      const storedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  const login = async (credentials: LoginCredentials, rememberMe = true) => {
    const data = await authService.login(credentials, rememberMe);
    setUser(data.usuario);
  };

  const register = async (credentials: RegisterCredentials, rememberMe = true) => {
    const data = await authService.register(credentials, rememberMe);
    setUser(data.usuario);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const setMockAuth = (mockUser: User, mockToken: string) => {
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const switchUserRole = (role: 'ADMIN' | 'GESTOR' | 'PRODUTOR') => {
    let targetUser = MOCK_GESTOR;
    if (role === 'ADMIN') targetUser = MOCK_ADMIN;
    else if (role === 'PRODUTOR') targetUser = MOCK_PRODUTOR;
    setMockAuth(targetUser, 'mock-jwt-token-agrotijuco-2026');
  };

  const isAdmin = user?.perfil === 'ADMIN' || user?.role === 'ADMIN';
  const isGestor = !user || user.perfil === 'GESTOR' || user.perfil === 'ADMIN' || user.role === 'GESTOR' || user.role === 'ADMIN';
  const isProdutor = !isGestor && !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        isAdmin,
        isGestor,
        isProdutor,
        showTechnicalDetails,
        setShowTechnicalDetails,
        toggleTechnicalDetails,
        login,
        register,
        logout,
        setMockAuth,
        switchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
