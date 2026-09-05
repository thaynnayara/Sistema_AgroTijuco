import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { usuarioService, type NovoUsuarioInput } from '../services/usuarioService';
import type { User } from '../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Loader2, 
  Building2, 
  Mail, 
  Crown, 
  Briefcase, 
  Tractor, 
  Wrench,
  UserCheck,
  RefreshCw,
  Trash2,
  Edit3
} from 'lucide-react';

export const Usuarios: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { propriedades } = useFarm();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroRole, setFiltroRole] = useState<string>('TODOS');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [novoRole, setNovoRole] = useState<User['role']>('GESTOR');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formNovo, setFormNovo] = useState<NovoUsuarioInput>({
    nome: '',
    email: '',
    senha: '',
    role: 'GESTOR',
    tenantId: 'Fazenda AgroTijuco',
  });

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNovo.nome || !formNovo.email || !formNovo.senha) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const novo = await usuarioService.cadastrar(formNovo);
      setUsuarios((prev) => [novo, ...prev]);
      setSuccessMsg(`Usuário "${novo.nome}" cadastrado com sucesso com perfil de ${novo.role}!`);
      setModalOpen(false);
      setFormNovo({
        nome: '',
        email: '',
        senha: '',
        role: 'GESTOR',
        tenantId: propriedades[0]?.nome || 'Fazenda AgroTijuco',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao cadastrar usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    const novoStatus = !targetUser.ativo;
    try {
      const atualizado = await usuarioService.atualizarStatus(targetUser.id, novoStatus);
      setUsuarios((prev) => prev.map((u) => (u.id === targetUser.id ? atualizado : u)));
      setSuccessMsg(`Status do usuário "${targetUser.nome}" alterado para ${novoStatus ? 'ATIVO' : 'INATIVO'}.`);
    } catch {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, ativo: novoStatus } : u))
      );
    }
  };

  const handleSalvarRole = async () => {
    if (!selectedUserForEdit) return;
    try {
      const atualizado = await usuarioService.atualizarRole(selectedUserForEdit.id, novoRole);
      setUsuarios((prev) => prev.map((u) => (u.id === selectedUserForEdit.id ? atualizado : u)));
      setSuccessMsg(`Perfil de "${selectedUserForEdit.nome}" atualizado para ${novoRole}!`);
      setEditRoleModalOpen(false);
      setSelectedUserForEdit(null);
    } catch {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === selectedUserForEdit.id ? { ...u, role: novoRole, perfil: novoRole as any } : u))
      );
      setEditRoleModalOpen(false);
    }
  };

  const handleDeletar = async (targetUser: User) => {
    if (targetUser.email === user?.email) {
      alert('Você não pode excluir o seu próprio usuário logado.');
      return;
    }
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${targetUser.nome}"?`)) {
      return;
    }
    try {
      await usuarioService.deletar(targetUser.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== targetUser.id));
      setSuccessMsg(`Usuário "${targetUser.nome}" removido do sistema.`);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir usuário.');
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300">
            <Crown className="w-3.5 h-3.5 mr-1 text-purple-700" />
            ADMIN GERAL
          </span>
        );
      case 'GESTOR':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Briefcase className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            GESTOR DA FAZENDA
          </span>
        );
      case 'PRODUTOR':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Tractor className="w-3.5 h-3.5 mr-1 text-amber-700" />
            PRODUTOR RURAL
          </span>
        );
      case 'OPERADOR':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Wrench className="w-3.5 h-3.5 mr-1 text-slate-600" />
            OPERADOR DE CAMPO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {role || 'PADRÃO'}
          </span>
        );
    }
  };

  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.role === 'ADMIN' || u.perfil === 'ADMIN').length;
  const totalGestores = usuarios.filter((u) => u.role === 'GESTOR' || u.perfil === 'GESTOR').length;
  const totalProdutores = usuarios.filter((u) => u.role === 'PRODUTOR' || u.perfil === 'PRODUTOR').length;
  const totalAtivos = usuarios.filter((u) => u.ativo !== false).length;

  const filtrados = usuarios.filter((u) => {
    const matchSearch =
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.tenantId && u.tenantId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;
    if (filtroRole === 'TODOS') return true;
    if (filtroRole === 'ATIVOS') return u.ativo !== false;
    if (filtroRole === 'INATIVOS') return u.ativo === false;
    return u.role === filtroRole || u.perfil === filtroRole;
  });

  return (
    <div className="space-y-6">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <ShieldCheck className="w-7 h-7 text-agro-primary mr-2" />
            Gestão de Usuários & Perfis de Acesso
          </h1>
          <p className="text-sm text-slate-600">
            {isAdmin
              ? 'Controle total de todos os usuários, permissões globais e administradores da plataforma AgroTijuco.'
              : 'Visualize os usuários cadastrados e adicione membros para a sua equipe.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={carregarUsuarios}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setErrorMsg(null);
              setSuccessMsg(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Cadastrar Novo Usuário
          </button>
        </div>
      </div>

      {/* FEEDBACK MSG */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Usuários</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalUsuarios}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cadastrados</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-card">
          <div className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center">
            <Crown className="w-3.5 h-3.5 mr-1" />
            Admins
          </div>
          <div className="text-2xl font-black text-purple-900 mt-1">{totalAdmins}</div>
          <div className="text-[11px] text-purple-700 mt-0.5">Acesso Global</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-card">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center">
            <Briefcase className="w-3.5 h-3.5 mr-1" />
            Gestores
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{totalGestores}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Gestão Fazenda</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-card">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center">
            <Tractor className="w-3.5 h-3.5 mr-1" />
            Produtores
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{totalProdutores}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Operações Rurais</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-teal-200 bg-teal-50/30 shadow-card">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            Ativos
          </div>
          <div className="text-2xl font-black text-teal-900 mt-1">{totalAtivos}</div>
          <div className="text-[11px] text-teal-700 mt-0.5">Com Login Liberado</div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar usuário por nome, e-mail ou fazenda/tenant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary focus:bg-white transition-colors"
          />
        </div>

        {/* CHIPS DE FILTRO */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {['TODOS', 'ADMIN', 'GESTOR', 'PRODUTOR', 'OPERADOR', 'ATIVOS', 'INATIVOS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFiltroRole(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filtroRole === tab
                  ? 'bg-agro-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'TODOS' ? 'Todos os Usuários' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA DE USUÁRIOS */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-card">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-agro-primary mb-2" />
          Carregando usuários cadastrados...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 shadow-card">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          Nenhum usuário encontrado com os filtros aplicados.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Usuário / Identificação</th>
                  <th className="px-4 py-3.5">Perfil de Acesso</th>
                  <th className="px-4 py-3.5">Fazenda / Tenant</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((u) => {
                  const isCurrentUser = u.email === user?.email;
                  const isUserAtivo = u.ativo !== false;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* USUÁRIO & EMAIL */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-600 text-white'
                              : u.role === 'GESTOR'
                              ? 'bg-agro-primary text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center">
                              {u.nome}
                              {isCurrentUser && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-full">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center mt-0.5">
                              <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* PERFIL */}
                      <td className="px-4 py-4">
                        {getRoleBadge(u.role || u.perfil)}
                      </td>

                      {/* FAZENDA / TENANT */}
                      <td className="px-4 py-4">
                        <div className="flex items-center text-slate-800 font-medium">
                          <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
                          <span>{u.tenantId || 'Fazenda AgroTijuco'}</span>
                        </div>
                        {u.produtorNome && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Produtor: {u.produtorNome}
                          </div>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isCurrentUser}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            isUserAtivo
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                          } ${isCurrentUser ? 'opacity-70 cursor-not-allowed' : ''}`}
                          title={isCurrentUser ? 'Não é possível inativar seu próprio usuário' : 'Clique para alternar status'}
                        >
                          {isUserAtivo ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
                              Inativo
                            </>
                          )}
                        </button>
                      </td>

                      {/* AÇÕES */}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedUserForEdit(u);
                              setNovoRole(u.role || 'GESTOR');
                              setEditRoleModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-agro-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Alterar perfil de acesso"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {!isCurrentUser && (
                            <button
                              onClick={() => handleDeletar(u)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO DE NOVO USUÁRIO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center">
              <UserPlus className="w-6 h-6 text-agro-primary mr-2" />
              Cadastrar Novo Usuário no Sistema
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Crie contas com permissões de Administrador Geral, Gestor da Fazenda, Produtor Rural ou Operador de Campo.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formNovo.nome}
                  onChange={(e) => setFormNovo({ ...formNovo, nome: e.target.value })}
                  placeholder="Ex: Ana Paula Soares"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail de Acesso (Login)
                </label>
                <input
                  type="email"
                  required
                  value={formNovo.email}
                  onChange={(e) => setFormNovo({ ...formNovo, email: e.target.value })}
                  placeholder="ana.paula@fazenda.com.br"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha Provisória
                </label>
                <input
                  type="password"
                  required
                  value={formNovo.senha}
                  onChange={(e) => setFormNovo({ ...formNovo, senha: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Perfil de Permissão
                  </label>
                  <select
                    value={formNovo.role}
                    onChange={(e) => setFormNovo({ ...formNovo, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  >
                    <option value="ADMIN">ADMIN (Administrador Geral)</option>
                    <option value="GESTOR">GESTOR (Gestor da Fazenda)</option>
                    <option value="PRODUTOR">PRODUTOR (Produtor Rural)</option>
                    <option value="OPERADOR">OPERADOR (Operador de Campo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fazenda / Propriedade (Tenant)
                  </label>
                  <select
                    value={formNovo.tenantId}
                    onChange={(e) => setFormNovo({ ...formNovo, tenantId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  >
                    <option value="Fazenda AgroTijuco">Fazenda AgroTijuco (Principal)</option>
                    {propriedades.map((p) => (
                      <option key={p.id} value={p.nome || p.nomeFazenda}>
                        {p.nome || p.nomeFazenda}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover rounded-xl flex items-center shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ALTERAÇÃO DE PERFIL */}
      {editRoleModalOpen && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center">
              <Edit3 className="w-5 h-5 text-agro-primary mr-2" />
              Alterar Perfil de Acesso
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Usuário: <strong>{selectedUserForEdit.nome}</strong> ({selectedUserForEdit.email})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecione o Novo Nível de Permissão
                </label>
                <select
                  value={novoRole}
                  onChange={(e) => setNovoRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agro-primary"
                >
                  <option value="ADMIN">ADMIN - Acesso irrestrito a todo o sistema e usuários</option>
                  <option value="GESTOR">GESTOR - Gestão completa da fazenda e lançamentos</option>
                  <option value="PRODUTOR">PRODUTOR - Acesso ao portal do produtor</option>
                  <option value="OPERADOR">OPERADOR - Lançamento de dados zootécnicos</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditRoleModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarRole}
                  className="px-5 py-2 text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover rounded-xl shadow-sm cursor-pointer"
                >
                  Salvar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
