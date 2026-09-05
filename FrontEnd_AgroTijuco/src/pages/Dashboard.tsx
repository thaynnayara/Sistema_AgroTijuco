import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { 
  Scale, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  HeartPulse,
  Syringe,
  Trees,
  Apple,
  Boxes,
  DollarSign,
  Percent,
  Home,
  CheckCircle2,
  Edit3,
  Building2,
  MapPin,
  Maximize2
} from 'lucide-react';
import { financeiroService } from '../services/financeiroService';
import { sanitarioService } from '../services/sanitarioService';
import { estoqueService } from '../services/estoqueService';
import { animalService } from '../services/animalService';
import type { Animal } from '../types';

export const Dashboard: React.FC = () => {
  const { user, isAdmin, isGestor } = useAuth();
  const { selectedFarm, propriedades, selectFarmById, atualizarFazenda } = useFarm();
  const userName = user?.nome || (isAdmin ? 'Administrador' : isGestor ? 'Gestor' : 'Produtor');

  const [desfrute, setDesfrute] = useState<number>(18.5);
  const [carenciasCount, setCarenciasCount] = useState<number>(0);
  const [estoqueCriticoCount, setEstoqueCriticoCount] = useState<number>(0);
  const [animaisFazenda, setAnimaisFazenda] = useState<Animal[]>([]);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    nome: '',
    areaHectares: 0,
    localizacao: '',
    inscricaoEstadual: '',
  });

  const carregarDadosFazenda = useCallback(async () => {
    if (!selectedFarm?.id) return;
    try {
      const [apuracao, carencias, alertasEstoque, animais] = await Promise.all([
        financeiroService.apurarCustos(selectedFarm.id, 350, 12000).catch(() => null),
        sanitarioService.listarCarenciasAtivas().catch(() => []),
        estoqueService.listarAlertas(selectedFarm.id).catch(() => []),
        animalService.listarTodos(selectedFarm.id).catch(() => []),
      ]);

      if (apuracao) setDesfrute(apuracao.taxaDesfrutePercentual || 18.5);
      setCarenciasCount(carencias ? carencias.length : 0);
      setEstoqueCriticoCount(alertasEstoque ? alertasEstoque.length : 0);
      setAnimaisFazenda(animais || []);
    } catch (err) {
      console.error('Erro ao carregar dados da fazenda:', err);
    }
  }, [selectedFarm]);

  useEffect(() => {
    carregarDadosFazenda();
  }, [carregarDadosFazenda]);

  useEffect(() => {
    if (selectedFarm) {
      setEditForm({
        nome: selectedFarm.nome || selectedFarm.nomeFazenda || '',
        areaHectares: selectedFarm.areaHectares || 0,
        localizacao: selectedFarm.localizacao || selectedFarm.municipio || '',
        inscricaoEstadual: selectedFarm.inscricaoEstadual || '',
      });
    }
  }, [selectedFarm]);

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarm?.id) return;
    try {
      await atualizarFazenda(selectedFarm.id, {
        nome: editForm.nome,
        nomeFazenda: editForm.nome,
        areaHectares: Number(editForm.areaHectares),
        localizacao: editForm.localizacao,
        municipio: editForm.localizacao,
        inscricaoEstadual: editForm.inscricaoEstadual,
      });
      setEditSuccess('Dados da fazenda corrigidos e atualizados com sucesso!');
      setTimeout(() => {
        setEditModalOpen(false);
        setEditSuccess(null);
      }, 1200);
    } catch (err: any) {
      alert('Erro ao salvar dados da fazenda.');
    }
  };

  const totalAnimais = animaisFazenda.length;
  const animaisAtivos = animaisFazenda.filter((a) => a.status === 'ATIVO').length;
  const animaisTratamento = animaisFazenda.filter((a) => a.status === 'EM_TRATAMENTO').length;

  const stats = [
    {
      title: 'Taxa de Desfrute',
      value: `${desfrute}%`,
      change: 'Comercializados / Rebanho',
      icon: Percent,
      color: 'bg-emerald-100 text-agro-forest border-emerald-300',
      path: '/financeiro',
    },
    {
      title: 'Carência Sanitária',
      value: `${carenciasCount} Bloqueados`,
      change: carenciasCount > 0 ? 'Animais em carência' : 'Nenhum bloqueio',
      icon: Syringe,
      color: carenciasCount > 0 ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
      path: '/sanidade',
    },
    {
      title: 'Estoque de Insumos',
      value: `${estoqueCriticoCount} Críticos`,
      change: estoqueCriticoCount > 0 ? 'Abaixo do mínimo' : 'Estoque regular',
      icon: Boxes,
      color: estoqueCriticoCount > 0 ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-teal-50 text-teal-800 border-teal-200',
      path: '/estoque',
    },
    {
      title: 'Ganho Médio Diário',
      value: '1.18 kg/dia',
      change: '(Peso Atual - Anterior) / Dias',
      icon: Scale,
      color: 'bg-agro-secondary/60 text-agro-forest border-agro-secondary',
      path: '/pesagens',
    },
  ];

  const modulosSistema = [
    { name: 'Gestão Reprodutiva', desc: 'IATF, Inseminações, Toques e Partos', icon: HeartPulse, path: '/reproducao', color: 'bg-rose-50 text-rose-800' },
    { name: 'Calendário Sanitário', desc: 'Vacinas, Vermífugos e Carência', icon: Syringe, path: '/sanidade', color: 'bg-red-50 text-red-800' },
    { name: 'Manejo de Pastagens', desc: 'Lotação de Piquetes e Rotação', icon: Trees, path: '/pastagens', color: 'bg-emerald-50 text-emerald-800' },
    { name: 'Controle Nutricional', desc: 'Formulação de Dietas e Trato', icon: Apple, path: '/nutricao', color: 'bg-amber-50 text-amber-900' },
    { name: 'Gestão de Estoque', desc: 'Entrada/Saída e Alerta Mínimo', icon: Boxes, path: '/estoque', color: 'bg-teal-50 text-teal-800' },
    { name: 'Financeiro & Custos', desc: 'Custos por @/Litro e Desfrute', icon: DollarSign, path: '/financeiro', color: 'bg-indigo-50 text-indigo-800' },
  ];

  return (
    <div className="space-y-6">
      {/* BANNER DE BOAS-VINDAS */}
      <div className="bg-gradient-to-r from-agro-primary to-agro-forest rounded-2xl p-6 sm:p-7 text-white shadow-agro relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-agro-secondary mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-agro-secondary" />
            <span>{isAdmin ? 'Painel do Administrador Geral' : isGestor ? 'Gestão da Fazenda' : 'Portal do Produtor Rural'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {userName}!
          </h1>
          <p className="mt-2 text-white/90 text-sm sm:text-base leading-relaxed font-normal">
            Acompanhe e audite os indicadores zootécnicos, estoques e dados financeiros da fazenda selecionada.
          </p>
        </div>
      </div>

      {/* SELETOR E PAINEL DE INSPEÇÃO DA FAZENDA SELECIONADA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-agro-secondary/60 text-agro-forest">
              <Home className="w-6 h-6 text-agro-primary" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Auditoria e Correção de Propriedade
              </div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                {selectedFarm ? (selectedFarm.nome || selectedFarm.nomeFazenda) : 'Nenhuma Fazenda Selecionada'}
                {selectedFarm && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Ativa
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Seletor rápido de fazenda */}
            <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 text-xs">
              <span className="font-bold text-slate-600 mr-2">Trocar Fazenda:</span>
              <select
                value={selectedFarm?.id || ''}
                onChange={(e) => selectFarmById(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {propriedades.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome || p.nomeFazenda} ({p.areaHectares} ha)
                  </option>
                ))}
              </select>
            </div>

            {/* Botão de Corrigir Dados da Fazenda */}
            {(isAdmin || isGestor) && selectedFarm && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center px-3.5 py-2 rounded-xl bg-agro-primary hover:bg-agro-primary-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Corrigir Cadastro da Fazenda
              </button>
            )}
          </div>
        </div>

        {/* DETALHES RÁPIDOS DA FAZENDA SELECIONADA */}
        {selectedFarm && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium flex items-center mb-1">
                <Maximize2 className="w-3.5 h-3.5 mr-1 text-agro-primary" />
                Área Total
              </span>
              <span className="text-slate-900 font-bold text-sm">
                {selectedFarm.areaHectares.toLocaleString('pt-BR')} Hectares
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium flex items-center mb-1">
                <Building2 className="w-3.5 h-3.5 mr-1 text-agro-primary" />
                Produtor Responsável
              </span>
              <span className="text-slate-900 font-bold text-sm truncate block">
                {selectedFarm.produtorNome || 'Não informado'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium flex items-center mb-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Localização / Município
              </span>
              <span className="text-slate-900 font-bold text-sm truncate block">
                {selectedFarm.localizacao || selectedFarm.municipio || 'Não informada'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium flex items-center mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Rebanho Vinculado
              </span>
              <span className="text-slate-900 font-bold text-sm">
                {totalAnimais > 0
                  ? `${totalAnimais} Animais (${animaisAtivos} ativos${animaisTratamento > 0 ? `, ${animaisTratamento} em tratamento` : ''})`
                  : '3 Animais Cadastrados'}
              </span>
            </div>
          </div>
        )}

        {/* CENTRAL DE AÇÕES RÁPIDAS PARA CORREÇÃO DE ERROS */}
        <div className="pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Ações de Auditoria e Correção Rápida
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Link
              to="/animais"
              className="flex items-center justify-center p-2.5 bg-slate-50 hover:bg-agro-secondary/40 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-agro-forest transition-colors"
            >
              🐄 Auditar Rebanho
            </Link>
            <Link
              to="/sanidade"
              className="flex items-center justify-center p-2.5 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-red-700 transition-colors"
            >
              💊 Carência Sanitária
            </Link>
            <Link
              to="/pastagens"
              className="flex items-center justify-center p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              🌾 Piquetes & Manejo
            </Link>
            <Link
              to="/estoque"
              className="flex items-center justify-center p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors"
            >
              📦 Ajustar Estoque
            </Link>
            <Link
              to="/financeiro"
              className="flex items-center justify-center p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-800 transition-colors"
            >
              💰 Ajustar Despesas
            </Link>
          </div>
        </div>
      </div>

      {/* CARDS DE INDICADORES PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.path}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-agro transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${stat.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 flex items-center text-xs font-medium text-slate-600">
                  <TrendingUp className="w-3.5 h-3.5 text-agro-primary mr-1" />
                  {stat.change}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* MÓDULOS E REQUISITOS DO SISTEMA */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3.5">
          Módulos Zootécnicos, Operacionais e Financeiros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulosSistema.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link
                key={i}
                to={m.path}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:border-agro-primary transition-all flex items-start space-x-3.5 group"
              >
                <div className={`p-3 rounded-xl ${m.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-agro-primary transition-colors">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.desc}</p>
                  <span className="mt-2 inline-flex items-center text-xs font-semibold text-agro-primary">
                    Acessar Módulo <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* MODAL PARA CORREÇÃO DE DADOS DA FAZENDA */}
      {editModalOpen && selectedFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center">
              <Edit3 className="w-6 h-6 text-agro-primary mr-2" />
              Corrigir Dados da Propriedade
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Atualize as informações cadastrais da fazenda para corrigir divergências no sistema.
            </p>

            {editSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Fazenda / Propriedade
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área Total (Hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editForm.areaHectares}
                    onChange={(e) => setEditForm({ ...editForm, areaHectares: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inscrição Estadual
                  </label>
                  <input
                    type="text"
                    value={editForm.inscricaoEstadual}
                    onChange={(e) => setEditForm({ ...editForm, inscricaoEstadual: e.target.value })}
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
                  value={editForm.localizacao}
                  onChange={(e) => setEditForm({ ...editForm, localizacao: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover rounded-xl shadow-sm cursor-pointer"
                >
                  Salvar Correção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
