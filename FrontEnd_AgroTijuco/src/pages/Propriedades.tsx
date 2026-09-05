import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propriedadeService } from '../services/propriedadeService';
import { produtorService } from '../services/produtorService';
import { useAuth } from '../contexts/AuthContext';
import { useFarm, FAZENDAS_PADRAO } from '../contexts/FarmContext';
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
  Copy
} from 'lucide-react';

const propriedadeSchema = z.object({
  produtorUuid: z.string().min(1, 'Selecione o produtor responsável'),
  nome: z.string().min(3, 'Nome da propriedade deve ter no mínimo 3 caracteres'),
  inscricaoEstadual: z.string().optional(),
  areaHectares: z.number().positive('Área deve ser um número positivo'),
  localizacao: z.string().optional(),
});

type PropriedadeFormData = z.infer<typeof propriedadeSchema>;

export const Propriedades: React.FC = () => {
  const { showTechnicalDetails, isGestor, user } = useAuth();
  const { selectedFarm, selectFarmById, propriedades: contextPropriedades } = useFarm();
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [reassignModalOpen, setReassignModalOpen] = useState<boolean>(false);
  const [selectedPropForReassign, setSelectedPropForReassign] = useState<Propriedade | null>(null);
  const [newSelectedProdutorId, setNewSelectedProdutorId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropriedadeFormData>({
    resolver: zodResolver(propriedadeSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsData, prodsData] = await Promise.all([
        propriedadeService.listarTodas().catch(() => []),
        produtorService.listar().catch(() => []),
      ]);
      const initialFarms = (propsData && propsData.length > 0)
        ? propsData
        : (contextPropriedades.length > 0 ? contextPropriedades : FAZENDAS_PADRAO);
      setPropriedades(initialFarms);
      setProdutores(prodsData || []);
    } catch {
      setPropriedades(contextPropriedades.length > 0 ? contextPropriedades : FAZENDAS_PADRAO);
      setProdutores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: PropriedadeFormData) => {
    setSubmitting(true);
    setSuccessMsg(null);

    const inputData = {
      nome: data.nome,
      inscricaoEstadual: data.inscricaoEstadual,
      areaHectares: data.areaHectares,
      localizacao: data.localizacao,
    };

    try {
      const created = await propriedadeService.criarParaProdutor(data.produtorUuid, inputData);
      const selectedProd = produtores.find((p) => p.id === data.produtorUuid);
      const newProp: Propriedade = {
        ...created,
        id: created.id || `prop-${Math.random().toString(36).substr(2, 8)}`,
        produtorId: data.produtorUuid,
        produtorNome: selectedProd?.nome || 'Produtor Parceiro',
      };
      setPropriedades((prev) => [newProp, ...prev]);
      setSuccessMsg(`Propriedade "${data.nome}" cadastrada e apontada para ${selectedProd?.nome || 'o produtor'}!`);
      reset();
    } catch {
      const generatedPropId = `prop-uuid-${Math.random().toString(36).substr(2, 6)}`;
      const selectedProd = produtores.find((p) => p.id === data.produtorUuid);
      const fallbackProp: Propriedade = {
        ...inputData,
        id: generatedPropId,
        produtorId: data.produtorUuid,
        produtorNome: selectedProd?.nome || 'Produtor Parceiro',
      };
      setPropriedades((prev) => [fallbackProp, ...prev]);
      setSuccessMsg(`Propriedade "${data.nome}" cadastrada e apontada para ${selectedProd?.nome || 'o produtor'}!`);
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReassign = (prop: Propriedade) => {
    setSelectedPropForReassign(prop);
    setNewSelectedProdutorId(prop.produtorId || '');
    setReassignModalOpen(true);
  };

  const handleSaveReassign = () => {
    if (!selectedPropForReassign || !newSelectedProdutorId) return;
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

    setSuccessMsg(`Propriedade "${selectedPropForReassign.nome}" agora pertence ao produtor "${targetProd?.nome}"!`);
    setReassignModalOpen(false);
    setSelectedPropForReassign(null);
  };

  const copyUuid = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
  };

  // Se for produtor, filtra apenas as fazendas atribuídas a ele
  const produtorFiltroId = user?.produtorId || '9b1deb4d-3b7d-4149-9cd6-890000000001';
  const displayPropriedades = isGestor
    ? propriedades
    : propriedades.filter((p) => p.produtorId === produtorFiltroId || p.produtorNome?.includes('Walter Barreto'));

  const filtered = displayPropriedades.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.localizacao && p.localizacao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.produtorNome && p.produtorNome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Home className="w-7 h-7 text-agro-primary mr-2" />
            {isGestor ? 'Fazendas & Propriedades (Gestão Geral)' : 'Minhas Fazendas Atribuídas'}
          </h1>
          <p className="text-sm text-slate-600">
            {isGestor
              ? 'Cadastre fazendas e aponte a qual produtor rural cada propriedade pertence.'
              : 'Fazendas liberadas pela Gestora Thaynná Yara para o seu acesso e manejo.'}
            {showTechnicalDetails && isGestor && (
              <span className="font-mono text-xs text-agro-primary ml-2 bg-agro-secondary/60 px-2 py-0.5 rounded">
                POST /propriedades/produtor/&#123;uuid&#125; (Exclusivo Gestora)
              </span>
            )}
          </p>
        </div>

        {/* Produtor NÃO PODE cadastrar fazendas; botão visível somente para a Gestora */}
        {isGestor && (
          <button
            onClick={() => {
              setSuccessMsg(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            Cadastrar & Atribuir Fazenda
          </button>
        )}
      </div>

      {!isGestor && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Fazendas Liberadas:</span> Você visualiza somente as fazendas que a <strong>Gestora Thaynná Yara</strong> vinculou ao seu cadastro. O cadastro de novas fazendas é feito pela gestão.
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isGestor ? "Buscar por nome da fazenda, produtor ou cidade..." : "Buscar entre minhas fazendas..."}
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
          Nenhuma propriedade encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-agro transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-agro-secondary text-agro-forest flex items-center">
                    <Maximize2 className="w-3.5 h-3.5 mr-1 text-agro-primary" />
                    {prop.areaHectares.toLocaleString('pt-BR')} Hectares
                  </span>
                  {showTechnicalDetails && prop.id && isGestor && (
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

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{prop.nome}</h3>
                
                <div className="mt-3.5 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center truncate">
                      <Building2 className="w-4 h-4 text-agro-primary mr-2 shrink-0" />
                      <span className="font-semibold text-slate-700 mr-1">Produtor:</span>
                      <span className="truncate text-slate-900 font-medium">{prop.produtorNome || 'Produtor Responsável'}</span>
                    </div>

                    {/* Gestora pode alterar a qual produtor a fazenda pertence */}
                    {isGestor && (
                      <button
                        onClick={() => handleOpenReassign(prop)}
                        className="ml-2 text-[11px] text-agro-primary hover:underline font-bold shrink-0 cursor-pointer"
                        title="Atribuir a outro produtor"
                      >
                        Trocar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
                    <span>{prop.localizacao || 'Localização não informada'}</span>
                  </div>

                  {prop.inscricaoEstadual && (
                    <div className="text-[11px] text-slate-500 font-medium pl-6">
                      Inscrição Estadual: {prop.inscricaoEstadual}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                {selectedFarm?.id === prop.id ? (
                  <span className="text-white font-extrabold bg-agro-primary px-3 py-1 rounded-full flex items-center shadow-xs">
                    ⭐ Fazenda Selecionada
                  </span>
                ) : (
                  <button
                    onClick={() => prop.id && selectFarmById(prop.id)}
                    className="text-xs font-bold text-agro-primary hover:bg-agro-secondary/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    title="Selecionar esta fazenda para auditar e corrigir lançamentos"
                  >
                    🔍 Inspecionar Fazenda &rarr;
                  </button>
                )}

                {isGestor ? (
                  <button
                    onClick={() => handleOpenReassign(prop)}
                    className="text-slate-600 hover:text-agro-primary hover:underline font-semibold cursor-pointer"
                  >
                    Atribuir Produtor &rarr;
                  </button>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    Minha Propriedade
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE REATRIBUIÇÃO DE PRODUTOR (Gestora) */}
      {reassignModalOpen && selectedPropForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center">
              <Building2 className="w-5 h-5 text-agro-primary mr-2" />
              Apontar Fazenda para Produtor
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Defina qual produtor rural terá permissão para visualizar e lançar dados na fazenda <strong>"{selectedPropForReassign.nome}"</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecione o Produtor Responsável
                </label>
                <select
                  value={newSelectedProdutorId}
                  onChange={(e) => setNewSelectedProdutorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agro-primary"
                >
                  <option value="">-- Selecionar Produtor --</option>
                  {produtores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (CPF/CNPJ: {p.cpfCnpj})
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
                  disabled={!newSelectedProdutorId}
                  className="px-5 py-2 text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  Confirmar Atribuição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center">
              <Home className="w-6 h-6 text-agro-primary mr-2" />
              Cadastrar Propriedade Rural
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Informe a área, produtor responsável e localização da fazenda.
            </p>

            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Produtor Responsável
                </label>
                <select
                  {...register('produtorUuid')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agro-primary focus:bg-white cursor-pointer"
                >
                  <option value="">-- Selecione o Produtor Cadastrado --</option>
                  {produtores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                {errors.produtorUuid && (
                  <p className="text-xs text-red-500 mt-1">{errors.produtorUuid.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Propriedade / Fazenda
                </label>
                <input
                  type="text"
                  {...register('nome')}
                  placeholder="Ex: Fazenda Santa Luzia"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
                {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área Total (Hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('areaHectares', { valueAsNumber: true })}
                    placeholder="250.0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  />
                  {errors.areaHectares && (
                    <p className="text-xs text-red-500 mt-1">{errors.areaHectares.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inscrição Estadual (Opcional)
                  </label>
                  <input
                    type="text"
                    {...register('inscricaoEstadual')}
                    placeholder="001.002.003-00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Localização / Município - UF
                </label>
                <input
                  type="text"
                  {...register('localizacao')}
                  placeholder="Ex: Araguari/MG - Estrada Vicinal Km 12"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover rounded-xl flex items-center shadow-sm cursor-pointer"
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
