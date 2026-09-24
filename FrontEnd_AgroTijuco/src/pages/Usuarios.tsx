import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { usuarioService, type NovoUsuarioInput } from '../services/usuarioService';
import { produtorService } from '../services/produtorService';
import { propriedadeService } from '../services/propriedadeService';
import type { User, Produtor, Propriedade } from '../types';
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
  Edit3,
  Link2,
  Plus,
  AlertCircle
} from 'lucide-react';

export const Usuarios: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { propriedades, recarregarFazendas, atualizarFazenda } = useFarm();
  
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroRole, setFiltroRole] = useState<string>('TODOS');
  
  // Modais
  const [modalNovoOpen, setModalNovoOpen] = useState<boolean>(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState<boolean>(false);
  const [vincularModalOpen, setVincularModalOpen] = useState<boolean>(false);
  
  // Usuários selecionados para edição
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [selectedUserForLink, setSelectedUserForLink] = useState<User | null>(null);
  
  // Estados de formulário
  const [novoRole, setNovoRole] = useState<User['role']>('GESTOR');
  const [selectedProdutorId, setSelectedProdutorId] = useState<string>('');
  const [selectedFarmIds, setSelectedFarmIds] = useState<string[]>([]);
  const [mostrarNovoProdutorForm, setMostrarNovoProdutorForm] = useState<boolean>(false);
  const [novoProdutorForm, setNovoProdutorForm] = useState({
    nome: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
  });

  const [formNovo, setFormNovo] = useState<NovoUsuarioInput>({
    nome: '',
    email: '',
    senha: '',
    role: 'PRODUTOR',
    tenantId: 'Fazenda AgroTijuco',
    produtorId: '',
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, prodData] = await Promise.all([
        usuarioService.listar().catch(() => []),
        produtorService.listar().catch(() => []),
      ]);
      setUsuarios(usersData);
      setProdutores(prodData);
      await recarregarFazendas().catch(() => {});
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [recarregarFazendas]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Localiza produtor vinculado a um usuário
  const getProdutorDoUsuario = useCallback((u: User): Produtor | undefined => {
    if (u.produtorId) {
      const found = produtores.find((p) => p.id === u.produtorId);
      if (found) return found;
    }
    const userEmail = (u.email || '').trim().toLowerCase();
    const userNome = (u.produtorNome || u.nome || '').trim().toLowerCase();
    return produtores.find(
      (p) => (p.email && p.email.trim().toLowerCase() === userEmail) ||
             (p.nome && p.nome.trim().toLowerCase() === userNome)
    );
  }, [produtores]);

  // Localiza fazendas vinculadas ao produtor/usuário
  const getFazendasDoUsuario = useCallback((u: User): Propriedade[] => {
    const produtor = getProdutorDoUsuario(u);
    const prodId = u.produtorId || produtor?.id;
    const userNome = (u.produtorNome || u.nome || '').trim().toLowerCase();
    const prodNome = (produtor?.nome || '').trim().toLowerCase();

    return propriedades.filter((fazenda) => {
      // 1. Vínculo já computado pelo backend DTO
      if (u.fazendas && u.fazendas.length > 0) {
        const nomeF = (fazenda.nomeFazenda || fazenda.nome || '').toLowerCase();
        if (u.fazendas.some((f) => f.toLowerCase() === nomeF)) {
          return true;
        }
      }

      // 2. Vínculo por UUID do produtor (chave primária ou multi-produtores)
      if (prodId) {
        if (fazenda.produtorId === prodId) return true;
        if (fazenda.produtoresIds && fazenda.produtoresIds.includes(prodId)) return true;
      }

      // 3. Vínculo por correspondência nominal
      if (userNome) {
        if (fazenda.produtorNome && fazenda.produtorNome.toLowerCase().includes(userNome)) return true;
        if (fazenda.produtorNomes && fazenda.produtorNomes.some((pn) => pn.toLowerCase().includes(userNome))) return true;
      }

      if (prodNome) {
        if (fazenda.produtorNome && fazenda.produtorNome.toLowerCase().includes(prodNome)) return true;
        if (fazenda.produtorNomes && fazenda.produtorNomes.some((pn) => pn.toLowerCase().includes(prodNome))) return true;
      }

      return false;
    });
  }, [propriedades, getProdutorDoUsuario]);

  // Abre modal para vincular produtor e fazendas ao usuário
  const handleAbrirVincular = (targetUser: User) => {
    setSelectedUserForLink(targetUser);
    setErrorMsg(null);
    setSuccessMsg(null);
    setMostrarNovoProdutorForm(false);
    
    const produtor = getProdutorDoUsuario(targetUser);
    setSelectedProdutorId(produtor?.id || targetUser.produtorId || '');

    const farms = getFazendasDoUsuario(targetUser);
    setSelectedFarmIds(farms.map((f) => f.id!).filter(Boolean));

    setNovoProdutorForm({
      nome: targetUser.nome || '',
      cpfCnpj: '',
      email: targetUser.email || '',
      telefone: '',
    });

    setVincularModalOpen(true);
  };

  // Salva o vínculo de produtor e fazendas
  const handleSalvarVinculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForLink) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      let finalProdutorId = selectedProdutorId;

      // Se o usuário optou por cadastrar um novo produtor
      if (mostrarNovoProdutorForm) {
        if (!novoProdutorForm.nome || !novoProdutorForm.cpfCnpj) {
          throw new Error('Informe o nome e CPF/CNPJ do novo produtor.');
        }
        const criado = await produtorService.criar({
          nome: novoProdutorForm.nome,
          cpfCnpj: novoProdutorForm.cpfCnpj,
          email: novoProdutorForm.email || selectedUserForLink.email,
          telefone: novoProdutorForm.telefone || '(00) 00000-0000',
        });
        finalProdutorId = criado.id || '';
        setProdutores((prev) => [criado, ...prev]);
      }

      // 1. Atualiza o vínculo do Produtor no Usuário
      const targetProdId = finalProdutorId && finalProdutorId !== 'none' ? finalProdutorId : null;
      const userAtualizado = await usuarioService.vincularProdutor(selectedUserForLink.id, targetProdId);

      // 2. Atualiza os produtores vinculados a cada propriedade selecionada / desselecionada
      if (targetProdId) {
        const promessasFazendas = propriedades.map(async (fazenda) => {
          if (!fazenda.id) return;
          const estaSelecionada = selectedFarmIds.includes(fazenda.id);
          const idsAtuais = new Set(fazenda.produtoresIds || (fazenda.produtorId ? [fazenda.produtorId] : []));
          const jaContem = idsAtuais.has(targetProdId);

          if (estaSelecionada && !jaContem) {
            idsAtuais.add(targetProdId);
            const novosIds = Array.from(idsAtuais);
            await propriedadeService.atribuirProdutores(fazenda.id, novosIds);
            await atualizarFazenda(fazenda.id, { produtoresIds: novosIds });
          } else if (!estaSelecionada && jaContem) {
            idsAtuais.delete(targetProdId);
            const novosIds = Array.from(idsAtuais);
            await propriedadeService.atribuirProdutores(fazenda.id, novosIds);
            await atualizarFazenda(fazenda.id, { produtoresIds: novosIds });
          }
        });

        await Promise.all(promessasFazendas);
      }

      setUsuarios((prev) =>
        prev.map((u) => (u.id === selectedUserForLink.id ? { ...u, ...userAtualizado, produtorId: targetProdId || undefined } : u))
      );

      setSuccessMsg(`Vínculos de Produtor e Fazendas salvos com sucesso para ${selectedUserForLink.nome}!`);
      setVincularModalOpen(false);
      await carregarDados();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar vínculo de produtor e fazendas.');
    } finally {
      setSubmitting(false);
    }
  };

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
      const payload: NovoUsuarioInput = {
        ...formNovo,
        produtorId: formNovo.produtorId && formNovo.produtorId !== 'none' ? formNovo.produtorId : undefined,
      };
      const novo = await usuarioService.cadastrar(payload);
      setUsuarios((prev) => [novo, ...prev]);
      setSuccessMsg(`Usuário "${novo.nome}" cadastrado com sucesso com perfil de ${novo.role}!`);
      setModalNovoOpen(false);
      setFormNovo({
        nome: '',
        email: '',
        senha: '',
        role: 'PRODUTOR',
        tenantId: 'Fazenda AgroTijuco',
        produtorId: '',
      });
      await carregarDados();
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

  const handleMudarRoleDireto = async (targetUser: User, novoCargo: User['role']) => {
    if (targetUser.email === user?.email) {
      alert('Você não pode alterar o seu próprio perfil nesta listagem.');
      return;
    }
    try {
      await usuarioService.atualizarRole(targetUser.id, novoCargo);
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? { ...u, role: novoCargo, perfil: novoCargo as any }
            : u
        )
      );
      setSuccessMsg(`Perfil do usuário "${targetUser.nome}" alterado para ${novoCargo} com sucesso!`);
      await carregarDados();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao alterar perfil do usuário.');
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
      await carregarDados();
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
            GESTOR FAZENDA
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
            OPERADOR CAMPO
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

  const filtrados = useMemo(() => {
    return usuarios.filter((u) => {
      const nome = (u.nome || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const produtor = getProdutorDoUsuario(u);
      const prodNome = (produtor?.nome || u.produtorNome || '').toLowerCase();
      const prodDoc = (produtor?.cpfCnpj || u.produtorCpfCnpj || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchSearch = 
        nome.includes(term) || 
        email.includes(term) || 
        prodNome.includes(term) || 
        prodDoc.includes(term);

      if (!matchSearch) return false;
      if (filtroRole === 'TODOS') return true;
      if (filtroRole === 'ATIVOS') return u.ativo !== false;
      if (filtroRole === 'INATIVOS') return u.ativo === false;
      return u.role === filtroRole || u.perfil === filtroRole;
    });
  }, [usuarios, searchTerm, filtroRole, getProdutorDoUsuario]);

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
              ? 'Controle de usuários, perfis, vínculos com produtores rurais e fazendas associadas.'
              : 'Visualize os usuários cadastrados e adicione membros para a sua equipe.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={carregarDados}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer transition-all"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setErrorMsg(null);
              setSuccessMsg(null);
              setModalNovoOpen(true);
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
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 font-bold ml-2 cursor-pointer">✕</button>
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
            placeholder="Buscar por nome de usuário, e-mail, produtor rural ou CPF/CNPJ..."
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
          Carregando usuários e produtores cadastrados...
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
                  <th className="px-4 py-3.5">Produtor Vinculado</th>
                  <th className="px-4 py-3.5">Fazendas Associadas</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((u) => {
                  const isCurrentUser = u.email === user?.email;
                  const isUserAtivo = u.ativo !== false;
                  const produtor = getProdutorDoUsuario(u);
                  const fazendasVinculadas = getFazendasDoUsuario(u);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* USUÁRIO & EMAIL */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-600 text-white'
                              : u.role === 'GESTOR'
                              ? 'bg-agro-primary text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {(u.nome || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center">
                              {u.nome || 'Sem Nome'}
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
                        {isCurrentUser ? (
                          getRoleBadge(u.role || u.perfil)
                        ) : (
                          <select
                            value={u.role || u.perfil || 'PRODUTOR'}
                            onChange={(e) => handleMudarRoleDireto(u, e.target.value as any)}
                            className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-agro-primary cursor-pointer transition-all ${
                              (u.role || u.perfil) === 'ADMIN'
                                ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                                : (u.role || u.perfil) === 'GESTOR'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                : (u.role || u.perfil) === 'PRODUTOR'
                                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                            }`}
                            title="Clique para alterar perfil (ex: Gestor para Produtor)"
                          >
                            <option value="PRODUTOR">🚜 Produtor Rural</option>
                            <option value="GESTOR">💼 Gestor da Fazenda</option>
                            <option value="ADMIN">👑 Administrador Geral</option>
                            <option value="OPERADOR">🔧 Operador de Campo</option>
                          </select>
                        )}
                      </td>

                      {/* PRODUTOR VINCULADO */}
                      <td className="px-4 py-4">
                        {produtor ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
                              <Tractor className="w-3.5 h-3.5 mr-1.5 text-amber-700 shrink-0" />
                              {produtor.nome}
                            </span>
                            {produtor.cpfCnpj && (
                              <span className="text-[11px] text-slate-500 font-mono ml-1">
                                CPF/CNPJ: {produtor.cpfCnpj}
                              </span>
                            )}
                            <button
                              onClick={() => handleAbrirVincular(u)}
                              className="text-[10px] text-agro-primary hover:underline font-semibold flex items-center ml-1 cursor-pointer"
                            >
                              <Link2 className="w-3 h-3 mr-0.5" />
                              Alterar vínculo
                            </button>
                          </div>
                        ) : u.produtorNome ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-950 border border-amber-200">
                              <Tractor className="w-3.5 h-3.5 mr-1.5 text-amber-700 shrink-0" />
                              {u.produtorNome}
                            </span>
                            {u.produtorCpfCnpj && (
                              <span className="text-[11px] text-slate-500 font-mono ml-1">
                                {u.produtorCpfCnpj}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAbrirVincular(u)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer transition-all"
                            title="Vincular usuário a um Produtor Rural"
                          >
                            <Link2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                            + Vincular Produtor
                          </button>
                        )}
                      </td>

                      {/* FAZENDAS ASSOCIADAS */}
                      <td className="px-4 py-4">
                        {u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                            <Crown className="w-3 h-3 mr-1" />
                            Todas as Fazendas (Acesso Global)
                          </span>
                        ) : fazendasVinculadas.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {fazendasVinculadas.map((f) => (
                              <span
                                key={f.id || f.nome}
                                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200"
                                title={`Área: ${f.areaHectares || 0} ha | ${f.municipio || f.localizacao || ''}`}
                              >
                                <Building2 className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
                                {f.nomeFazenda || f.nome}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200">
                              Sem fazenda vinculada
                            </span>
                            <button
                              onClick={() => handleAbrirVincular(u)}
                              className="p-1 text-agro-primary hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="Vincular fazendas"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
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
                            onClick={() => handleAbrirVincular(u)}
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-amber-200"
                            title="Vincular Produtor & Fazendas"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>

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

      {/* MODAL DE VINCULAR PRODUTOR & FAZENDAS */}
      {vincularModalOpen && selectedUserForLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <Link2 className="w-6 h-6 text-agro-primary mr-2" />
                  Vincular Produtor & Fazendas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Usuário: <strong className="text-slate-800">{selectedUserForLink.nome}</strong> ({selectedUserForLink.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVincularModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSalvarVinculo} className="space-y-6">
              {/* ETAPA 1: SELEÇÃO DO PRODUTOR RURAL */}
              <div className="space-y-3 bg-amber-50/50 border border-amber-200 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center">
                    <Tractor className="w-4 h-4 mr-1.5 text-amber-700" />
                    1. Produtor Rural Associado
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarNovoProdutorForm(!mostrarNovoProdutorForm)}
                    className="text-xs font-bold text-agro-primary hover:underline cursor-pointer"
                  >
                    {mostrarNovoProdutorForm ? 'Selecionar existente' : '+ Cadastrar novo produtor'}
                  </button>
                </div>

                {!mostrarNovoProdutorForm ? (
                  <div>
                    <select
                      value={selectedProdutorId}
                      onChange={(e) => setSelectedProdutorId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary font-medium"
                    >
                      <option value="">-- Selecione o Produtor Cadastrado no BD --</option>
                      <option value="none">-- Nenhum (Desvincular do Produtor) --</option>
                      {produtores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} {p.cpfCnpj ? `(${p.cpfCnpj})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-amber-800 mt-1">
                      Vincula a conta de login ao cadastro oficial do produtor rural no sistema.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-amber-200">
                    <div className="text-xs font-bold text-slate-800">
                      Cadastrar Novo Produtor no Banco de Dados:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nome do Produtor *
                        </label>
                        <input
                          type="text"
                          required
                          value={novoProdutorForm.nome}
                          onChange={(e) => setNovoProdutorForm({ ...novoProdutorForm, nome: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          placeholder="Ex: João da Silva"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          CPF ou CNPJ *
                        </label>
                        <input
                          type="text"
                          required
                          value={novoProdutorForm.cpfCnpj}
                          onChange={(e) => setNovoProdutorForm({ ...novoProdutorForm, cpfCnpj: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          placeholder="000.000.000-00"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          E-mail de Contato
                        </label>
                        <input
                          type="email"
                          value={novoProdutorForm.email}
                          onChange={(e) => setNovoProdutorForm({ ...novoProdutorForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          placeholder="contato@fazenda.com"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Telefone / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={novoProdutorForm.telefone}
                          onChange={(e) => setNovoProdutorForm({ ...novoProdutorForm, telefone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          placeholder="(34) 99999-9999"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ETAPA 2: FAZENDAS VINCULADAS */}
              <div className="space-y-3 bg-emerald-50/50 border border-emerald-200 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center">
                    <Building2 className="w-4 h-4 mr-1.5 text-emerald-700" />
                    2. Fazendas Vinculadas a este Produtor
                  </label>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFarmIds(propriedades.map((p) => p.id!).filter(Boolean))}
                      className="text-[11px] text-emerald-800 font-bold hover:underline cursor-pointer"
                    >
                      Marcar Todas
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFarmIds([])}
                      className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800">
                  Selecione todas as fazendas às quais este produtor pertence (suporta múltiplas fazendas):
                </p>

                {propriedades.length === 0 ? (
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 text-center text-xs text-slate-500">
                    Nenhuma fazenda cadastrada na plataforma ainda.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {propriedades.map((p) => {
                      const isSelected = selectedFarmIds.includes(p.id!);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-start p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-100/70 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 rounded text-agro-primary focus:ring-agro-primary mr-2 cursor-pointer"
                            checked={isSelected}
                            onChange={() => {
                              if (!p.id) return;
                              if (isSelected) {
                                setSelectedFarmIds(selectedFarmIds.filter((id) => id !== p.id));
                              } else {
                                setSelectedFarmIds([...selectedFarmIds, p.id]);
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs truncate">{p.nomeFazenda || p.nome}</div>
                            <div className="text-[10px] text-slate-500 font-normal truncate">
                              {p.areaHectares || 0} ha • {p.municipio || p.localizacao || 'Localização não informada'}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AÇÕES DO MODAL */}
              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVincularModalOpen(false)}
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
                  Salvar Vínculos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO DE NOVO USUÁRIO */}
      {modalNovoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <UserPlus className="w-6 h-6 text-agro-primary mr-2" />
                  Cadastrar Novo Usuário no Sistema
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Crie contas com permissões de Administrador, Gestor, Produtor Rural ou Operador.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
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
                  E-mail de Acesso (Login) *
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
                  Senha Provisória *
                </label>
                <input
                  type="password"
                  required
                  value={formNovo.senha}
                  onChange={(e) => setFormNovo({ ...formNovo, senha: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perfil de Permissão
                </label>
                <select
                  value={formNovo.role}
                  onChange={(e) => setFormNovo({ ...formNovo, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agro-primary font-medium"
                >
                  <option value="PRODUTOR">PRODUTOR (Produtor Rural)</option>
                  <option value="GESTOR">GESTOR (Gestor da Fazenda)</option>
                  <option value="ADMIN">ADMIN (Administrador Geral)</option>
                  <option value="OPERADOR">OPERADOR (Operador de Campo)</option>
                </select>
              </div>

              {/* VINCULAR PRODUTOR EXISTENTE */}
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 space-y-1.5">
                <label className="block text-xs font-bold text-amber-950 flex items-center">
                  <Tractor className="w-4 h-4 mr-1 text-amber-700" />
                  Vincular a um Produtor Rural Existente (Opcional)
                </label>
                <select
                  value={formNovo.produtorId || ''}
                  onChange={(e) => setFormNovo({ ...formNovo, produtorId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-agro-primary"
                >
                  <option value="">-- Não vincular ou criar automaticamente --</option>
                  {produtores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.cpfCnpj ? `(${p.cpfCnpj})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-800">
                  Se selecionado, o novo usuário já terá acesso imediato aos dados das fazendas deste produtor.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovoOpen(false)}
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agro-primary font-medium"
                >
                  <option value="ADMIN">ADMIN - Acesso irrestrito a todo o sistema e usuários</option>
                  <option value="GESTOR">GESTOR - Gestão completa da fazenda e lançamentos</option>
                  <option value="PRODUTOR">PRODUTOR - Acesso ao portal do produtor rural</option>
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
