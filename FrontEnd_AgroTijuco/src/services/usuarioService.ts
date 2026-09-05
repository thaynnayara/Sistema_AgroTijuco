import api from './api';
import type { User } from '../types';
import { authService } from './authService';

const USERS_STORAGE_KEY = '@AgroTijuco:usuarios_sistema';

export interface NovoUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  role: 'ADMIN' | 'GESTOR' | 'PRODUTOR' | 'OPERADOR';
  tenantId: string;
  produtorId?: string;
}

const USUARIOS_INICIAIS: User[] = [
  {
    id: 'f5e95a07-bc6e-4cd0-aecd-96b92883e932',
    nome: 'Thaynná Yara',
    email: 'thaynna.yara@agrotijuco.com.br',
    perfil: 'ADMIN',
    role: 'ADMIN',
    tenantId: 'Fazenda AgroTijuco',
    ativo: true,
    createdAt: '2026-09-05T11:55:00.000Z',
  },
  {
    id: '3ff5799f-c4d7-45b1-9426-1763e5b7d394',
    nome: 'Admin AgroTijuco',
    email: 'admin@agrotijuco.com.br',
    perfil: 'ADMIN',
    role: 'ADMIN',
    tenantId: 'Fazenda AgroTijuco',
    ativo: true,
    createdAt: '2026-09-05T11:53:00.000Z',
  },
  {
    id: 'b11deb4d-3b7d-4149-9cd6-890000000001',
    nome: 'Walter Barreto',
    email: 'walter.barreto@fazenda.com.br',
    perfil: 'PRODUTOR',
    role: 'PRODUTOR',
    tenantId: 'Fazenda AgroTijuco',
    produtorId: '9b1deb4d-3b7d-4149-9cd6-890000000001',
    produtorNome: 'Walter Barreto',
    ativo: true,
    createdAt: '2026-09-05T11:58:00.000Z',
  },
  {
    id: 'b11deb4d-3b7d-4149-9cd6-890000000002',
    nome: 'Carlos Eduardo Ribeiro',
    email: 'carlos.ribeiro@agro.com.br',
    perfil: 'PRODUTOR',
    role: 'PRODUTOR',
    tenantId: 'Fazenda AgroTijuco',
    produtorId: '9b1deb4d-3b7d-4149-9cd6-890000000002',
    produtorNome: 'Carlos Eduardo Ribeiro',
    ativo: true,
    createdAt: '2026-09-05T12:00:00.000Z',
  },
  {
    id: 'b11deb4d-3b7d-4149-9cd6-890000000003',
    nome: 'Marcos Silveira (Operador de Campo)',
    email: 'marcos.operador@agrotijuco.com.br',
    perfil: 'OPERADOR',
    role: 'OPERADOR',
    tenantId: 'Fazenda AgroTijuco',
    ativo: true,
    createdAt: '2026-09-05T12:05:00.000Z',
  }
];

function obterUsuariosLocais(): User[] {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(USUARIOS_INICIAIS));
    return USUARIOS_INICIAIS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return USUARIOS_INICIAIS;
  }
}

function salvarUsuariosLocais(usuarios: User[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usuarios));
}

export const usuarioService = {
  async listar(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/api/v1/usuarios');
      if (Array.isArray(response.data) && response.data.length > 0) {
        salvarUsuariosLocais(response.data);
        return response.data;
      }
    } catch {
      try {
        const fallbackRes = await api.get<User[]>('/usuarios');
        if (Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
          salvarUsuariosLocais(fallbackRes.data);
          return fallbackRes.data;
        }
      } catch {}
    }
    return obterUsuariosLocais();
  },

  async atualizarStatus(id: string, ativo: boolean): Promise<User> {
    try {
      await api.patch(`/api/v1/usuarios/${id}/status?ativo=${ativo}`);
    } catch {
      try {
        await api.patch(`/usuarios/${id}/status?ativo=${ativo}`);
      } catch {}
    }

    const locais = obterUsuariosLocais();
    const atualizados = locais.map((u) => (u.id === id ? { ...u, ativo } : u));
    salvarUsuariosLocais(atualizados);
    const encontrado = atualizados.find((u) => u.id === id);
    if (!encontrado) throw new Error('Usuário não encontrado');
    return encontrado;
  },

  async atualizarRole(id: string, role: User['role']): Promise<User> {
    try {
      await api.patch(`/api/v1/usuarios/${id}/role?role=${role}`);
    } catch {
      try {
        await api.patch(`/usuarios/${id}/role?role=${role}`);
      } catch {}
    }

    const locais = obterUsuariosLocais();
    const atualizados = locais.map((u) =>
      u.id === id ? { ...u, role, perfil: role as User['perfil'] } : u
    );
    salvarUsuariosLocais(atualizados);
    const encontrado = atualizados.find((u) => u.id === id);
    if (!encontrado) throw new Error('Usuário não encontrado');
    return encontrado;
  },

  async cadastrar(input: NovoUsuarioInput): Promise<User> {
    try {
      await authService.cadastrarNovoUsuario({
        nome: input.nome,
        email: input.email,
        senha: input.senha,
        tenantId: input.tenantId || 'Fazenda AgroTijuco',
        role: input.role,
      });
    } catch (e) {
      console.warn('Erro na chamada do backend, persistindo usuário localmente:', e);
    }

    const novoUsuario: User = {
      id: crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`,
      nome: input.nome,
      email: input.email,
      perfil: input.role,
      role: input.role,
      tenantId: input.tenantId || 'Fazenda AgroTijuco',
      produtorId: input.produtorId,
      ativo: true,
      createdAt: new Date().toISOString(),
    };

    const locais = obterUsuariosLocais();
    const existe = locais.some((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existe) {
      throw new Error('E-mail já cadastrado na plataforma.');
    }
    const lista = [novoUsuario, ...locais];
    salvarUsuariosLocais(lista);
    return novoUsuario;
  },

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(`/api/v1/usuarios/${id}`);
    } catch {
      try {
        await api.delete(`/usuarios/${id}`);
      } catch {}
    }

    const locais = obterUsuariosLocais();
    const filtrados = locais.filter((u) => u.id !== id);
    salvarUsuariosLocais(filtrados);
  },
};
