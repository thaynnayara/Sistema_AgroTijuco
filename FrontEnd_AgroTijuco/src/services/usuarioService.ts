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

function obterUsuariosLocais(): User[] {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    return list.filter((u: User) => 
      !u.email.includes('walter.barreto') && 
      !u.email.includes('carlos.ribeiro') && 
      !u.email.includes('marcos.operador')
    );
  } catch {
    return [];
  }
}

function salvarUsuariosLocais(usuarios: User[]) {
  const limpos = (usuarios || []).filter((u: User) => 
    !u.email.includes('walter.barreto') && 
    !u.email.includes('carlos.ribeiro') && 
    !u.email.includes('marcos.operador')
  );
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(limpos));
}

export const usuarioService = {
  async listar(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/api/v1/usuarios');
      if (Array.isArray(response.data)) {
        salvarUsuariosLocais(response.data);
        return response.data;
      }
    } catch {
      try {
        const fallbackRes = await api.get<User[]>('/usuarios');
        if (Array.isArray(fallbackRes.data)) {
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
