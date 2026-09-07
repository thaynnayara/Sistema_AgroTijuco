import React, { useState, useEffect } from 'react';
import { propriedadeService } from '../services/propriedadeService';
import { produtorService } from '../services/produtorService';
import { usuarioService } from '../services/usuarioService';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import type { Propriedade, Produtor } from '../types';
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
  AlertCircle
} from 'lucide-react';

export const Propriedades: React.FC = () => {
  const { showTechnicalDetails, isGestor, isAdmin, user } = useAuth();
  const { selectedFarm, selectFarmById, recarregarFazendas, propriedades: contextPropriedades } = useFarm();
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [reassignModalOpen, setReassignModalOpen] = useState<boolean>(false);
  const [selectedPropForReassign, setSelectedPropForReassign] = useState<Propriedade | null>(null);
  const [newSelectedProdutorId, setNewSelectedProdutorId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Formulário de Propriedade
  const [nomeFazenda, setNomeFazenda] = useState('');
  const [areaHectares, setAreaHectares] = useState<number>(100);
  const [localizacao, setLocalizacao] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [selectedProdutorId, setSelectedProdutorId] = useState('');

  // Modo rápido de criação de produtor inline
  const [isNewProducerMode, setIsNewProducerMode] = useState(false);
  const [novoProdutorNome, setNovoProdutorNome] = useState('');
  const [novoProdutorCpfCnpj, setNovoProdutorCpfCnpj] = useState('');
  const [novoProdutorTelefone, setNovoProdutorTelefone] = useState('');
  const [novoProdutorEmail, setNovoProdutorEmail] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsData, prodsData] = await Promise.all([
        propriedadeService.listarTodas().catch(() => []),
        produtorService.listar().catch(() => []),
      ]);

      const initialFarms = (propsData && propsData.length > 0)
        ? propsData
        : contextPropriedades;
      setPropriedades(initialFarms);

      const prodsMap = new Map<string, Produtor>();
      (prodsData || []).forEach((p: Produtor) => {
        if (p && p.id) {
          prodsMap.set(p.id, p);
        }
      });

      try {
        const users = await usuarioService.listar().catch(() => []);
        (users || [])
          .filter((u: any) => u.role === 'PRODUTOR' || u.perfil === 'PRODUTOR')
          .forEach((u: any) => {
            const uid = u.produtorId || u.id;
            const exists = Array.from(prodsMap.values()).some(
              (p) => p.id === uid || p.id === u.id || (p.nome && u.nome && p.nome.trim().toLowerCase() === u.nome.trim().toLowerCase())
            );
            if (!exists) {
              prodsMap.set(u.id, {
                id: u.id,
                nome: u.nome,
                cpfCnpj: u.cpfCnpj || 'Produtor (Usuário Cadastrado)',
                email: u.email,
                telefone: u.telefone || '',
              });
            }
          });
      } catch {}

      const prods = Array.from(prodsMap.values());
      setProdutores(prods);
      setIsNewProducerMode(false);
      setSelectedProdutorId('');
    } catch {
      setPropriedades(contextPropriedades);
      setProdutores([]);
      setIsNewProducerMode(false);
      setSelectedProdutorId('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

    setIsNewProducerMode(false);
    setSelectedProdutorId('');
    setModalOpen(true);
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
      let finalProdutorId: string | undefined = selectedProdutorId || undefined;
      let finalProdutorNome = '';

      // Se o usuário está cadastrando um novo produtor inline
      if (isNewProducerMode) {
        if (!novoProdutorNome.trim()) {
          setErrorMsg('Informe o nome do produtor rural.');
          setSubmitting(false);
          return;
        }
        if (!novoProdutorCpfCnpj.trim()) {
          setErrorMsg('Informe o CPF ou CNPJ do produtor.');
          setSubmitting(false);
          return;
        }

        const novoProd = await produtorService.criar({
          nome: novoProdutorNome.trim(),
          cpfCnpj: novoProdutorCpfCnpj.trim(),
          telefone: novoProdutorTelefone.trim() || '(00) 00000-0000',
          email: novoProdutorEmail.trim() || 'produtor@agrotijuco.com.br',
        });

        finalProdutorId = novoProd.id || undefined;
        finalProdutorNome = novoProd.nome;

        // Atualiza lista de produtores locais
        setProdutores(prev => [novoProd, ...prev]);
      } else if (finalProdutorId) {
        const prod = produtores.find(p => p.id === finalProdutorId);
        finalProdutorNome = prod?.nome || 'Produtor Responsável';
      }

      const inputData = {
        nome: nomeFazenda.trim(),
        nomeFazenda: nomeFazenda.trim(),
        areaHectares: Number(areaHectares),
        localizacao: localizacao.trim() || 'Localização não informada',
        municipio: localizacao.trim() || 'Localização não informada',
        inscricaoEstadual: inscricaoEstadual.trim(),
      };

      const created = await propriedadeService.criarParaProdutor(finalProdutorId || undefined, inputData);

      const novaProp: Propriedade = {
        ...created,
        id: created.id || `prop-${Date.now()}`,
        nome: created.nome || created.nomeFazenda || inputData.nome,
        nomeFazenda: created.nomeFazenda || inputData.nome,
        areaHectares: created.areaHectares || inputData.areaHectares,
        localizacao: created.localizacao || created.municipio || inputData.localizacao,
        municipio: created.municipio || inputData.localizacao,
        produtorId: finalProdutorId || undefined,
        produtorNome: finalProdutorNome || undefined,
      };

      setPropriedades(prev => [novaProp, ...prev]);
      await recarregarFazendas();
      if (!selectedFarm || !selectedFarm.id) {
        selectFarmById(novaProp.id!);
      }

      setSuccessMsg(
        finalProdutorNome
          ? `Propriedade "${novaProp.nome}" cadastrada e vinculada com sucesso a ${finalProdutorNome}!`
          : `Propriedade "${novaProp.nome}" cadastrada com sucesso (sem produtor vinculado)!`
      );
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao cadastrar propriedade:', err);
      setErrorMsg(err.response?.data?.message || 'Erro ao cadastrar propriedade. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReassign = (prop: Propriedade) => {
    setSelectedPropForReassign(prop);
    setNewSelectedProdutorId(prop.produtorId || '');
    setReassignModalOpen(true);
  };

  const handleSaveReassign = async () => {
    if (!selectedPropForReassign || !selectedPropForReassign.id) return;
    setSubmitting(true);
    try {
      if (newSelectedProdutorId) {
        await propriedadeService.atribuirProdutor(selectedPropForReassign.id, newSelectedProdutorId);
        const targetProd = produtores.find((p) => p.id === newSelectedProdutorId);

        setPropriedades((prev) =>
          prev.map((p) =>
            p.id === selectedPropForReassign.id
              ? {
                  ...p,
                  produtorId: newSelectedProdutorId,
                  produtorNome: targetProd?.nome || 'Produtor Responsável',
                }
              : p
          )
        );
        setSuccessMsg(`Propriedade "${selectedPropForReassign.nome || selectedPropForReassign.nomeFazenda}" vinculada ao produtor "${targetProd?.nome}" com sucesso!`);
      } else {
        await propriedadeService.atribuirProdutor(selectedPropForReassign.id, null);
        setPropriedades((prev) =>
          prev.map((p) =>
            p.id === selectedPropForReassign.id
              ? {
                  ...p,
                  produtorId: undefined,
                  produtorNome: undefined,
                }
              : p
          )
        );
        setSuccessMsg(`Vínculo de produtor removido da propriedade "${selectedPropForReassign.nome || selectedPropForReassign.nomeFazenda}".`);
      }

      await recarregarFazendas();
      setReassignModalOpen(false);
      setSelectedPropForReassign(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar produtor da fazenda.');
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
      setPropriedades(prev => prev.filter(p => p.id !== prop.id));
      await recarregarFazendas();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir a propriedade.');
    }
  };

  const copyUuid = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
  };

  // Se for produtor, filtra apenas as fazendas atribuídas a ele
  const displayPropriedades = (isAdmin || isGestor) || !user?.produtorId
    ? propriedades
    : propriedades.filter((p) => p.produtorId === user.produtorId);

  const filtered = displayPropriedades.filter((p) => {
    const nome = (p.nome || p.nomeFazenda || '').toLowerCase();
    const loc = (p.localizacao || p.municipio || '').toLowerCase();
    const prod = (p.produtorNome || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return nome.includes(term) || loc.includes(term) || prod.includes(term);
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
              ? 'Cadastre fazendas, vincule ao produtor rural responsável e selecione a fazenda ativa para os manejos.'
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
            Cadastrar & Vincular Fazenda
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
            placeholder={isGestor || isAdmin ? "Buscar por nome da fazenda, produtor ou município..." : "Buscar entre minhas fazendas..."}
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
              ? 'Clique em "Cadastrar & Vincular Fazenda" acima para registrar a primeira fazenda e apontar para o produtor responsável.'
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center truncate">
                        <Building2 className="w-4 h-4 text-agro-primary mr-2 shrink-0" />
                        <span className="font-semibold text-slate-700 mr-1">Produtor:</span>
                        {prop.produtorNome ? (
                          <span className="truncate text-slate-900 font-medium">{prop.produtorNome}</span>
                        ) : (
                          <span className="truncate italic text-slate-400 font-medium">Sem produtor vinculado</span>
                        )}
                      </div>

                      {(isGestor || isAdmin) && (
                        <button
                          onClick={() => handleOpenReassign(prop)}
                          className="ml-2 text-[11px] text-agro-primary hover:underline font-bold shrink-0 cursor-pointer"
                          title={prop.produtorId ? "Vincular a outro produtor" : "Vincular produtor"}
                        >
                          {prop.produtorId ? 'Trocar' : 'Vincular'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center">
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenReassign(prop)}
                        className="text-slate-600 hover:text-agro-primary hover:underline font-semibold cursor-pointer"
                      >
                        {prop.produtorId ? 'Trocar Produtor' : 'Vincular Produtor'}
                      </button>
                      <button
                        onClick={() => handleDelete(prop)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* MODAL DE REATRIBUIÇÃO DE PRODUTOR */}
      {reassignModalOpen && selectedPropForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center">
              <Building2 className="w-5 h-5 text-agro-primary mr-2" />
              Vincular Fazenda a Produtor
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Selecione qual produtor rural é o responsável pela fazenda <strong>"{selectedPropForReassign.nome || selectedPropForReassign.nomeFazenda}"</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecione o Produtor
                </label>
                <select
                  value={newSelectedProdutorId}
                  onChange={(e) => setNewSelectedProdutorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agro-primary cursor-pointer"
                >
                  <option value="">-- Nenhum (Desvincular produtor) --</option>
                  {produtores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.cpfCnpj ? `(${p.cpfCnpj})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
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
                  Salvar Vínculo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO INTEGRADO DE FAZENDA & PRODUTOR */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center">
              <Home className="w-6 h-6 text-agro-primary mr-2" />
              Cadastrar Propriedade Rural
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Preencha os dados da fazenda e vincule opcionalmente ao produtor responsável.
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
              {/* SEÇÃO PRODUTOR RESPONSÁVEL */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center">
                    <Building2 className="w-4 h-4 text-agro-primary mr-1.5" />
                    Produtor Responsável (Opcional)
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsNewProducerMode(!isNewProducerMode)}
                    className="text-xs text-agro-primary hover:underline font-bold flex items-center cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    {isNewProducerMode ? 'Selecionar da Lista / Sem Produtor' : '+ Novo Produtor'}
                  </button>
                </div>

                {!isNewProducerMode ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Escolha o produtor na lista (opcional)
                    </label>
                    <select
                      value={selectedProdutorId}
                      onChange={(e) => setSelectedProdutorId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agro-primary cursor-pointer"
                    >
                      <option value="">-- Sem produtor vinculado (Vincular depois) --</option>
                      {produtores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} {p.cpfCnpj ? `(${p.cpfCnpj})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[11px] text-agro-forest font-semibold bg-agro-secondary/60 px-2.5 py-1 rounded-lg">
                      {produtores.length === 0
                        ? 'Nenhum produtor cadastrado no banco. Informe os dados do produtor abaixo para vinculá-lo:'
                        : 'Cadastrando novo produtor diretamente nesta fazenda:'}
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
    </div>
  );
};
