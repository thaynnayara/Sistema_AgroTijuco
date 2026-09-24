import React, { useState, useEffect } from 'react';
import { propriedadeService } from '../services/propriedadeService';
import { produtorService } from '../services/produtorService';
import { usuarioService } from '../services/usuarioService';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import type { Propriedade, Produtor, User } from '../types';
import { 
  Home, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Maximize2, 
  Building2, 
  Copy,
  Trash2,
  UserPlus,
  Star,
  AlertCircle,
  Users,
  ShieldCheck,
  Check,
  Edit3
} from 'lucide-react';

export const Propriedades: React.FC = () => {
  const { showTechnicalDetails, isGestor, isAdmin, user } = useAuth();
  const { 
    selectedFarm, 
    selectFarmById, 
    recarregarFazendas, 
    cadastrarFazenda, 
    atualizarFazenda,
    propriedades: contextPropriedades 
  } = useFarm();

  const [propriedades, setPropriedades] = useState<Propriedade[]>(contextPropriedades);
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [usuariosProdutores, setUsuariosProdutores] = useState<User[]>([]);
  const [realBackendProducerIds, setRealBackendProducerIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [reassignModalOpen, setReassignModalOpen] = useState<boolean>(false);
  const [selectedPropForReassign, setSelectedPropForReassign] = useState<Propriedade | null>(null);

  // Edição de Propriedade
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedPropForEdit, setSelectedPropForEdit] = useState<Propriedade | null>(null);
  const [editNomeFazenda, setEditNomeFazenda] = useState('');
  const [editAreaHectares, setEditAreaHectares] = useState<number>(100);
  const [editLocalizacao, setEditLocalizacao] = useState('');
  const [editInscricaoEstadual, setEditInscricaoEstadual] = useState('');
  
  // Múltiplos produtores selecionados
  const [selectedProdutorIds, setSelectedProdutorIds] = useState<string[]>([]);
  const [newSelectedProdutorIds, setNewSelectedProdutorIds] = useState<string[]>([]);
  const [producerSearchTerm, setProducerSearchTerm] = useState<string>('');
  const [reassignSearchTerm, setReassignSearchTerm] = useState<string>('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Formulário de Propriedade
  const [nomeFazenda, setNomeFazenda] = useState('');
  const [areaHectares, setAreaHectares] = useState<number>(100);
  const [localizacao, setLocalizacao] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');

  // Modo rápido de criação de produtor inline
  const [isNewProducerMode, setIsNewProducerMode] = useState(false);
  const [novoProdutorNome, setNovoProdutorNome] = useState('');
  const [novoProdutorCpfCnpj, setNovoProdutorCpfCnpj] = useState('');
  const [novoProdutorTelefone, setNovoProdutorTelefone] = useState('');
  const [novoProdutorEmail, setNovoProdutorEmail] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsData, prodsData, usersData] = await Promise.all([
        propriedadeService.listarTodas().catch(() => []),
        produtorService.listar().catch(() => []),
        usuarioService.listar().catch(() => []),
      ]);

      if (propsData && propsData.length > 0) {
        setPropriedades(propsData);
      } else if (contextPropriedades && contextPropriedades.length > 0) {
        setPropriedades(contextPropriedades);
      }

      const usersProdList = (usersData || []).filter(
        (u: any) => u.role === 'PRODUTOR' || u.perfil === 'PRODUTOR'
      );
      setUsuariosProdutores(usersProdList);

      const prodsMap = new Map<string, Produtor>();
      const backendIds = new Set<string>();

      (prodsData || []).forEach((p: Produtor) => {
        if (p && p.id) {
          prodsMap.set(p.id, p);
          backendIds.add(p.id);
        }
      });
      setRealBackendProducerIds(backendIds);

      // Sincroniza e vincula usuários com perfil PRODUTOR à lista de produtores disponíveis
      usersProdList.forEach((u: any) => {
        const uid = u.produtorId || u.id;
        const exists = Array.from(prodsMap.values()).some(
          (p) => p.id === uid || p.id === u.id || (p.nome && u.nome && p.nome.trim().toLowerCase() === u.nome.trim().toLowerCase())
        );
        if (!exists) {
          prodsMap.set(u.id, {
            id: u.id,
            nome: u.nome,
            cpfCnpj: u.produtorCpfCnpj || 'Usuário Cadastrado',
            email: u.email,
            telefone: u.telefone || '',
          });
        }
      });

      const prods = Array.from(prodsMap.values());
      setProdutores(prods);
    } catch {
      setPropriedades(contextPropriedades);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mantém propriedades sincronizadas com o contextPropriedades se ele tiver mais itens
  useEffect(() => {
    if (contextPropriedades && contextPropriedades.length > 0 && propriedades.length === 0) {
      setPropriedades(contextPropriedades);
    }
  }, [contextPropriedades]);

  const ensureRealProducerId = async (producerId: string): Promise<string> => {
    if (!producerId) return '';
    if (realBackendProducerIds.has(producerId)) return producerId;

    const prod = produtores.find((p) => p.id === producerId);
    if (!prod) return producerId;

    try {
      const doc = (prod.cpfCnpj && !prod.cpfCnpj.includes('Usuário Cadastrado') && prod.cpfCnpj.trim())
        ? prod.cpfCnpj.trim()
        : '000.000.000-00';
      const created = await produtorService.criar({
        nome: prod.nome,
        cpfCnpj: doc,
        telefone: prod.telefone || '(00) 00000-0000',
        email: prod.email || `${prod.nome.toLowerCase().replace(/\s+/g, '.')}@agrotijuco.com.br`,
      });
      if (created && created.id) {
        setRealBackendProducerIds((prev) => new Set(prev).add(created.id));
        setProdutores((prev) =>
          prev.map((p) => (p.id === producerId ? { ...p, id: created.id, cpfCnpj: doc } : p))
        );
        return created.id;
      }
    } catch (e) {
      console.warn('Erro ao sincronizar produtor no backend:', e);
    }
    return producerId;
  };

  const handleOpenModal = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setNomeFazenda('');
    setAreaHectares(100);
    setLocalizacao('');
    setInscricaoEstadual('');
    setNovoProdutorNome('');
    setNovoProdutorCpfCnpj('');
    setNovoProdutorTelefone('');
    setNovoProdutorEmail('');
    setProducerSearchTerm('');
    setSelectedProdutorIds([]);
    setIsNewProducerMode(false);
    setModalOpen(true);
  };

  const handleToggleProducerSelection = (producerId: string) => {
    setSelectedProdutorIds((prev) => 
      prev.includes(producerId) 
        ? prev.filter((id) => id !== producerId) 
        : [...prev, producerId]
    );
  };

  const handleToggleReassignSelection = (producerId: string) => {
    setNewSelectedProdutorIds((prev) => 
      prev.includes(producerId) 
        ? prev.filter((id) => id !== producerId) 
        : [...prev, producerId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nomeFazenda.trim()) {
      setErrorMsg('O nome da fazenda é obrigatório.');
      setSubmitting(false);
      return;
    }

    if (!areaHectares || areaHectares <= 0) {
      setErrorMsg('A área em hectares deve ser maior que zero.');
      setSubmitting(false);
      return;
    }

    try {
      const finalProducerIds: string[] = [];

      // 1. Processa os produtores selecionados
      for (const pid of selectedProdutorIds) {
        const realId = await ensureRealProducerId(pid);
        if (realId && !finalProducerIds.includes(realId)) {
          finalProducerIds.push(realId);
        }
      }

      // 2. Se cadastrou novo produtor inline
      if (isNewProducerMode && novoProdutorNome.trim()) {
        if (!novoProdutorCpfCnpj.trim()) {
          setErrorMsg('Informe o CPF ou CNPJ do novo produtor.');
          setSubmitting(false);
          return;
        }

        const novoProd = await produtorService.criar({
          nome: novoProdutorNome.trim(),
          cpfCnpj: novoProdutorCpfCnpj.trim(),
          telefone: novoProdutorTelefone.trim() || '(00) 00000-0000',
          email: novoProdutorEmail.trim() || 'produtor@agrotijuco.com.br',
        });

        if (novoProd && novoProd.id) {
          finalProducerIds.push(novoProd.id);
          setRealBackendProducerIds((prev) => new Set(prev).add(novoProd.id!));
          setProdutores((prev) => [novoProd, ...prev]);
        }
      }

      const inputData = {
        nome: nomeFazenda.trim(),
        nomeFazenda: nomeFazenda.trim(),
        areaHectares: Number(areaHectares),
        localizacao: localizacao.trim() || 'Localização não informada',
        municipio: localizacao.trim() || 'Localização não informada',
        inscricaoEstadual: inscricaoEstadual.trim(),
      };

      // Usa cadastrarFazenda do context que salva no backend E sincroniza o cache local
      const createdFarm = await cadastrarFazenda(inputData, finalProducerIds);

      // Garante que a lista local tenha a nova fazenda
      setPropriedades((prev) => [createdFarm, ...prev.filter((p) => p.id !== createdFarm.id)]);

      if (!selectedFarm || !selectedFarm.id) {
        selectFarmById(createdFarm.id!);
      }

      const nomesVinculados = produtores
        .filter((p) => p.id && finalProducerIds.includes(p.id))
        .map((p) => p.nome)
        .join(', ');

      setSuccessMsg(
        finalProducerIds.length > 0
          ? `Fazenda "${createdFarm.nome}" cadastrada e vinculada a: ${nomesVinculados || 'Produtor(es)'}!`
          : `Fazenda "${createdFarm.nome}" cadastrada com sucesso (sem produtores vinculados)!`
      );

      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao cadastrar propriedade:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Erro ao cadastrar propriedade. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReassign = (prop: Propriedade) => {
    setSelectedPropForReassign(prop);
    const existing = prop.produtoresIds && prop.produtoresIds.length > 0 
      ? prop.produtoresIds 
      : (prop.produtorId ? [prop.produtorId] : []);
    setNewSelectedProdutorIds(existing);
    setReassignSearchTerm('');
    setReassignModalOpen(true);
  };

  const handleSaveReassign = async () => {
    if (!selectedPropForReassign || !selectedPropForReassign.id) return;
    setSubmitting(true);
    try {
      const realIds: string[] = [];
      for (const pid of newSelectedProdutorIds) {
        const realId = await ensureRealProducerId(pid);
        if (realId && !realIds.includes(realId)) {
          realIds.push(realId);
        }
      }

      const targetProds = produtores.filter((p) => p.id && realIds.includes(p.id));
      const nomes = targetProds.map((p) => p.nome);

      const atualizada = await atualizarFazenda(selectedPropForReassign.id, {
        produtoresIds: realIds,
        produtorId: realIds[0] || undefined,
        produtorNome: nomes.join(', ') || undefined,
        produtorNomes: nomes,
      });

      setPropriedades((prev) =>
        prev.map((p) => (p.id === selectedPropForReassign.id ? { ...p, ...atualizada } : p))
      );

      setSuccessMsg(
        realIds.length > 0
          ? `Fazenda vinculada com sucesso a ${nomes.join(', ')}!`
          : `Vínculos de produtores removidos da fazenda.`
      );

      setTimeout(() => {
        setReassignModalOpen(false);
        setSelectedPropForReassign(null);
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Erro ao atualizar produtores da fazenda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (prop: Propriedade) => {
    setSelectedPropForEdit(prop);
    setEditNomeFazenda(prop.nome || prop.nomeFazenda || '');
    setEditAreaHectares(prop.areaHectares || 100);
    setEditLocalizacao(prop.localizacao || prop.municipio || '');
    setEditInscricaoEstadual(prop.inscricaoEstadual || '');
    setErrorMsg(null);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropForEdit || !selectedPropForEdit.id) return;
    if (!editNomeFazenda.trim()) {
      alert('O nome da fazenda é obrigatório.');
      return;
    }
    if (!editAreaHectares || editAreaHectares <= 0) {
      alert('A área em hectares deve ser maior que zero.');
      return;
    }

    setSubmitting(true);
    try {
      const atualizada = await atualizarFazenda(selectedPropForEdit.id, {
        nome: editNomeFazenda.trim(),
        nomeFazenda: editNomeFazenda.trim(),
        areaHectares: Number(editAreaHectares),
        localizacao: editLocalizacao.trim() || 'Localização não informada',
        municipio: editLocalizacao.trim() || 'Localização não informada',
        inscricaoEstadual: editInscricaoEstadual.trim(),
      });

      setPropriedades((prev) =>
        prev.map((p) => (p.id === selectedPropForEdit.id ? { ...p, ...atualizada } : p))
      );

      setSuccessMsg(`Dados da fazenda "${atualizada.nome}" atualizados com sucesso!`);
      setEditModalOpen(false);
      setSelectedPropForEdit(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Erro ao atualizar dados da fazenda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (prop: Propriedade) => {
    if (!prop.id) return;
    const confirmDelete = window.confirm(
      `Deseja realmente excluir a propriedade "${prop.nome || prop.nomeFazenda}"? Esta ação removerá a fazenda do sistema.`
    );
    if (!confirmDelete) return;

    try {
      await propriedadeService.deletarPropriedade(prop.id);
      setPropriedades((prev) => prev.filter((p) => p.id !== prop.id));
      await recarregarFazendas();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Erro ao excluir a propriedade.');
    }
  };

  const copyUuid = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
  };

  // Se for produtor logado, filtra apenas as fazendas atribuídas a ele
  const displayPropriedades = (isAdmin || isGestor) || !user?.produtorId
    ? propriedades
    : propriedades.filter((p) => 
        p.produtorId === user.produtorId || 
        (p.produtoresIds && p.produtoresIds.includes(user.produtorId!))
      );

  const filtered = displayPropriedades.filter((p) => {
    const nome = (p.nome || p.nomeFazenda || '').toLowerCase();
    const loc = (p.localizacao || p.municipio || '').toLowerCase();
    const prod = (p.produtorNome || '').toLowerCase();
    const prodNomes = (p.produtorNomes || []).join(' ').toLowerCase();
    const term = searchTerm.toLowerCase();
    return nome.includes(term) || loc.includes(term) || prod.includes(term) || prodNomes.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Home className="w-7 h-7 text-agro-primary mr-2" />
            {isGestor || isAdmin ? 'Fazendas & Propriedades (Gestão Geral)' : 'Minhas Fazendas Atribuídas'}
          </h1>
          <p className="text-sm text-slate-600">
            {isGestor || isAdmin
              ? 'Cadastre fazendas, vincule múltiplos produtores rurais (co-proprietários) e gerencie a fazenda ativa para os manejos.'
              : 'Propriedades rurais vinculadas ao seu perfil de produtor para consulta e lançamentos.'}
          </p>
        </div>

        {/* Botão de cadastro visível para Gestor e Admin */}
        {(isGestor || isAdmin) && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            Cadastrar Fazenda & Vincular Produtores
          </button>
        )}
      </div>

      {!(isGestor || isAdmin) && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Fazendas Vinculadas:</span> Você visualiza as fazendas atribuídas ao seu cadastro de produtor. A troca de fazenda ativa é refletida em todos os módulos.
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-sm flex items-center shadow-xs">
          <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isGestor || isAdmin ? "Buscar por nome da fazenda, produtor responsável ou município..." : "Buscar entre minhas fazendas..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-agro-primary mb-2" />
          Carregando propriedades rurais...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 shadow-card">
          <Home className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-700 mt-2">Nenhuma propriedade cadastrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {isGestor || isAdmin
              ? 'Clique em "Cadastrar Fazenda & Vincular Produtores" acima para registrar a primeira fazenda e associar aos produtores rurais.'
              : 'Nenhuma fazenda foi vinculada ao seu usuário ainda. Entre em contato com a gestão da fazenda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((prop) => {
            const isCurrentActive = selectedFarm?.id === prop.id;
            const farmNome = prop.nome || prop.nomeFazenda || 'Fazenda sem nome';
            const farmLoc = prop.localizacao || prop.municipio || 'Localização não informada';
            const farmArea = prop.areaHectares ? prop.areaHectares.toLocaleString('pt-BR') : '0';

            // Lista de nomes de produtores
            const nomesProdutores: string[] = prop.produtorNomes && prop.produtorNomes.length > 0
              ? prop.produtorNomes
              : (prop.produtorNome ? prop.produtorNome.split(',').map((s) => s.trim()) : []);

            return (
              <div
                key={prop.id}
                className={`bg-white rounded-2xl border p-5 shadow-card transition-all duration-200 flex flex-col justify-between ${
                  isCurrentActive 
                    ? 'border-agro-primary ring-2 ring-agro-primary/20 shadow-agro' 
                    : 'border-slate-200 hover:shadow-agro'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-agro-secondary text-agro-forest flex items-center">
                      <Maximize2 className="w-3.5 h-3.5 mr-1 text-agro-primary" />
                      {farmArea} Hectares
                    </span>

                    <div className="flex items-center space-x-1">
                      {isCurrentActive && (
                        <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 mr-1 fill-emerald-600 text-emerald-600" />
                          Ativa
                        </span>
                      )}
                      {showTechnicalDetails && prop.id && (isGestor || isAdmin) && (
                        <button
                          onClick={() => copyUuid(prop.id!)}
                          className="text-[11px] font-mono text-slate-400 hover:text-agro-primary flex items-center bg-slate-50 px-2 py-0.5 rounded cursor-pointer"
                          title="Copiar UUID da Propriedade"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {prop.id.substring(0, 8)}...
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{farmNome}</h3>
                  
                  <div className="mt-3.5 space-y-2 text-xs text-slate-600">
                    {/* LISTAGEM DE PRODUTORES */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-700 flex items-center text-[11px]">
                          <Users className="w-3.5 h-3.5 text-agro-primary mr-1" />
                          {nomesProdutores.length > 1
                            ? `Produtores Rurais (${nomesProdutores.length}):`
                            : 'Produtor Rural:'}
                        </span>

                        {(isGestor || isAdmin) && (
                          <button
                            onClick={() => handleOpenReassign(prop)}
                            className="text-[11px] text-agro-primary hover:underline font-bold shrink-0 cursor-pointer"
                            title="Gerenciar vínculos de produtores"
                          >
                            {nomesProdutores.length > 0 ? 'Gerenciar' : '+ Vincular'}
                          </button>
                        )}
                      </div>

                      {nomesProdutores.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {nomesProdutores.map((nome, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 bg-white text-slate-800 border border-slate-200 rounded-md text-[11px] font-medium shadow-2xs"
                            >
                              <Building2 className="w-3 h-3 mr-1 text-agro-primary" />
                              {nome}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-slate-400 text-[11px]">
                          Sem produtores vinculados
                        </span>
                      )}
                    </div>

                    <div className="flex items-center pt-1">
                      <MapPin className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
                      <span>{farmLoc}</span>
                    </div>

                    {prop.inscricaoEstadual && (
                      <div className="text-[11px] text-slate-500 font-medium pl-6">
                        Inscrição Estadual: {prop.inscricaoEstadual}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  {isCurrentActive ? (
                    <span className="text-xs font-extrabold text-agro-forest bg-agro-secondary px-3 py-1.5 rounded-xl flex items-center">
                      ⭐ Fazenda em Uso
                    </span>
                  ) : (
                    <button
                      onClick={() => prop.id && selectFarmById(prop.id)}
                      className="text-xs font-bold text-agro-primary hover:bg-agro-secondary/50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-agro-primary/30"
                      title="Selecionar esta fazenda para operações em todos os módulos"
                    >
                      Ativar Fazenda &rarr;
                    </button>
                  )}

                  {(isGestor || isAdmin) && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(prop)}
                        className="p-1.5 text-slate-500 hover:text-agro-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                        title="Editar dados da fazenda (nome, área, localização)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenReassign(prop)}
                        className="text-xs px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
                        title="Gerenciar produtores rurais vinculados"
                      >
                        Produtores
                      </button>
                      <button
                        onClick={() => handleDelete(prop)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                        title="Excluir propriedade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE REATRIBUIÇÃO DE MÚLTIPLOS PRODUTORES */}
      {reassignModalOpen && selectedPropForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center">
              <Users className="w-5 h-5 text-agro-primary mr-2" />
              Vincular Produtores à Fazenda
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Selecione um ou mais produtores rurais responsáveis pela fazenda <strong>"{selectedPropForReassign.nome || selectedPropForReassign.nomeFazenda}"</strong>.
            </p>

            <div className="space-y-4">
              {/* CHIPS DOS SELECIONADOS */}
              {newSelectedProdutorIds.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">
                    Produtores Selecionados ({newSelectedProdutorIds.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-24 overflow-y-auto">
                    {newSelectedProdutorIds.map((pid) => {
                      const prod = produtores.find((p) => p.id === pid);
                      return (
                        <span
                          key={pid}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-200 shadow-2xs"
                        >
                          <Building2 className="w-3.5 h-3.5 text-agro-primary mr-1" />
                          {prod?.nome || 'Produtor'}
                          <button
                            type="button"
                            onClick={() => handleToggleReassignSelection(pid)}
                            className="ml-1.5 text-slate-400 hover:text-red-500 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BUSCA DE PRODUTORES */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar produtor por nome, CPF ou e-mail..."
                  value={reassignSearchTerm}
                  onChange={(e) => setReassignSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
              </div>

              {/* LISTA DE PRODUTORES */}
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                {produtores.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Nenhum produtor cadastrado no sistema.
                  </div>
                ) : (
                  produtores
                    .filter((p) => {
                      const term = reassignSearchTerm.toLowerCase();
                      return (
                        (p.nome || '').toLowerCase().includes(term) ||
                        (p.cpfCnpj || '').toLowerCase().includes(term) ||
                        (p.email || '').toLowerCase().includes(term)
                      );
                    })
                    .map((p) => {
                      const isChecked = newSelectedProdutorIds.includes(p.id || '');
                      const isLinkedToUser = usuariosProdutores.some(
                        (u) => u.id === p.id || u.produtorId === p.id || (u.email && p.email && u.email.toLowerCase() === p.email.toLowerCase())
                      );
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between px-3.5 py-2.5 text-xs cursor-pointer transition-colors ${
                            isChecked ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 truncate mr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => p.id && handleToggleReassignSelection(p.id)}
                              className="w-4 h-4 text-agro-primary rounded border-slate-300 focus:ring-agro-primary cursor-pointer"
                            />
                            <div className="truncate">
                              <div className="text-slate-900 font-medium truncate flex items-center">
                                {p.nome}
                                {isLinkedToUser && (
                                  <span className="ml-1.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200 flex items-center">
                                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                                    Usuário Cadastrado
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {p.cpfCnpj || 'Produtor Rural'} {p.email ? `• ${p.email}` : ''}
                              </div>
                            </div>
                          </div>
                          {isChecked && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center">
                              <Check className="w-3 h-3 mr-0.5" />
                              Selecionado
                            </span>
                          )}
                        </label>
                      );
                    })
                )}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewSelectedProdutorIds([])}
                  className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                >
                  Desvincular Todos
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setReassignModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReassign}
                    disabled={submitting}
                    className="px-5 py-2 text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover rounded-xl shadow-sm cursor-pointer disabled:opacity-50 flex items-center"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                    Salvar Vínculos ({newSelectedProdutorIds.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO INTEGRADO DE FAZENDA & MÚLTIPLOS PRODUTORES */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center">
              <Home className="w-6 h-6 text-agro-primary mr-2" />
              Cadastrar Propriedade Rural
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Preencha os dados da fazenda e selecione um ou mais produtores rurais (co-proprietários) vinculados.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-red-500" />
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SEÇÃO PRODUTORES RESPONSÁVEIS (MÚLTIPLOS) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center">
                    <Users className="w-4 h-4 text-agro-primary mr-1.5" />
                    Produtores Rurais ({selectedProdutorIds.length} selecionado{selectedProdutorIds.length !== 1 ? 's' : ''})
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsNewProducerMode(!isNewProducerMode)}
                    className="text-xs text-agro-primary hover:underline font-bold flex items-center cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    {isNewProducerMode ? 'Voltar à Lista' : '+ Novo Produtor'}
                  </button>
                </div>

                {!isNewProducerMode ? (
                  <div className="space-y-2.5">
                    {/* CHIPS DE PRODUTORES SELECIONADOS */}
                    {selectedProdutorIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-xl max-h-24 overflow-y-auto">
                        {selectedProdutorIds.map((pid) => {
                          const prod = produtores.find((p) => p.id === pid);
                          return (
                            <span
                              key={pid}
                              className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200"
                            >
                              <Building2 className="w-3 h-3 text-agro-primary mr-1" />
                              {prod?.nome || 'Produtor'}
                              <button
                                type="button"
                                onClick={() => handleToggleProducerSelection(pid)}
                                className="ml-1.5 text-emerald-600 hover:text-red-500 font-bold cursor-pointer"
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* BUSCA DE PRODUTORES */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar produtor cadastrado..."
                        value={producerSearchTerm}
                        onChange={(e) => setProducerSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agro-primary"
                      />
                    </div>

                    {/* LISTA DE PRODUTORES COM CHECKBOXES */}
                    <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                      {produtores.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Nenhum produtor cadastrado. Use "+ Novo Produtor" acima.
                        </div>
                      ) : (
                        produtores
                          .filter((p) => {
                            const term = producerSearchTerm.toLowerCase();
                            return (
                              (p.nome || '').toLowerCase().includes(term) ||
                              (p.cpfCnpj || '').toLowerCase().includes(term) ||
                              (p.email || '').toLowerCase().includes(term)
                            );
                          })
                          .map((p) => {
                            const isChecked = selectedProdutorIds.includes(p.id || '');
                            const isLinkedToUser = usuariosProdutores.some(
                              (u) => u.id === p.id || u.produtorId === p.id || (u.email && p.email && u.email.toLowerCase() === p.email.toLowerCase())
                            );
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                                  isChecked ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 truncate mr-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => p.id && handleToggleProducerSelection(p.id)}
                                    className="w-4 h-4 text-agro-primary rounded border-slate-300 focus:ring-agro-primary cursor-pointer"
                                  />
                                  <div className="truncate">
                                    <div className="text-slate-900 truncate flex items-center">
                                      {p.nome}
                                      {isLinkedToUser && (
                                        <span className="ml-1.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded border border-blue-200 flex items-center">
                                          <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                                          Usuário
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {p.cpfCnpj || 'Produtor Rural'} {p.email ? `• ${p.email}` : ''}
                                    </div>
                                  </div>
                                </div>
                                {isChecked && (
                                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.5 rounded shrink-0">
                                    Selecionado
                                  </span>
                                )}
                              </label>
                            );
                          })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[11px] text-agro-forest font-semibold bg-agro-secondary/60 px-2.5 py-1 rounded-lg">
                      Cadastrando novo produtor rural diretamente para vincular a esta fazenda:
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                        Nome do Produtor *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: João da Silva"
                        value={novoProdutorNome}
                        onChange={(e) => setNovoProdutorNome(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agro-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                          CPF ou CNPJ *
                        </label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          value={novoProdutorCpfCnpj}
                          onChange={(e) => setNovoProdutorCpfCnpj(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agro-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                          Telefone / Celular
                        </label>
                        <input
                          type="text"
                          placeholder="(34) 99999-8888"
                          value={novoProdutorTelefone}
                          onChange={(e) => setNovoProdutorTelefone(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agro-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                        E-mail
                      </label>
                      <input
                        type="email"
                        placeholder="produtor@email.com"
                        value={novoProdutorEmail}
                        onChange={(e) => setNovoProdutorEmail(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agro-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* DADOS DA PROPRIEDADE */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Propriedade / Fazenda *
                </label>
                <input
                  type="text"
                  value={nomeFazenda}
                  onChange={(e) => setNomeFazenda(e.target.value)}
                  placeholder="Ex: Fazenda Santa Luzia"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área Total (Hectares) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={areaHectares}
                    onChange={(e) => setAreaHectares(Number(e.target.value))}
                    placeholder="150"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inscrição Estadual (Opcional)
                  </label>
                  <input
                    type="text"
                    value={inscricaoEstadual}
                    onChange={(e) => setInscricaoEstadual(e.target.value)}
                    placeholder="001.002.003-00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Município - UF / Localização
                </label>
                <input
                  type="text"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Ex: Uberlândia/MG - Estrada Vicinal Km 12"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover rounded-xl flex items-center shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Salvar Propriedade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE DADOS DA FAZENDA */}
      {editModalOpen && selectedPropForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Edit3 className="w-5 h-5 text-agro-primary mr-2" />
                Editar Dados da Fazenda
              </h2>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Atualize o nome, área, localização ou inscrição estadual da propriedade.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Propriedade / Fazenda *
                </label>
                <input
                  type="text"
                  required
                  value={editNomeFazenda}
                  onChange={(e) => setEditNomeFazenda(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  placeholder="Ex: Fazenda Santa Luzia"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área Total (Hectares) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={editAreaHectares}
                    onChange={(e) => setEditAreaHectares(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inscrição Estadual (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editInscricaoEstadual}
                    onChange={(e) => setEditInscricaoEstadual(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                    placeholder="001.002.003-00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Município - UF / Localização
                </label>
                <input
                  type="text"
                  value={editLocalizacao}
                  onChange={(e) => setEditLocalizacao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  placeholder="Ex: Uberlândia/MG - Estrada Vicinal Km 12"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover rounded-xl flex items-center shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
