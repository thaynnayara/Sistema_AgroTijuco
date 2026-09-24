import React, { useState, useEffect } from 'react';
import { pesagemService } from '../services/pesagemService';
import { animalService } from '../services/animalService';
import { useFarm } from '../contexts/FarmContext';
import type { Pesagem, Animal } from '../types';
import { 
  Scale, 
  Plus, 
  Loader2, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Tag, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Award,
  History
} from 'lucide-react';

type FilterTab = 'TODAS' | 'ALTO' | 'MODERADO' | 'PERDA' | 'INICIAL';

export const Pesagens: React.FC = () => {
  const { selectedFarm, propriedades, selectFarmById } = useFarm();
  const [pesagens, setPesagens] = useState<Pesagem[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalEditOpen, setModalEditOpen] = useState<boolean>(false);
  const [editingPesagem, setEditingPesagem] = useState<Pesagem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPropId, setSelectedPropId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<FilterTab>('TODAS');

  const [form, setForm] = useState({
    animalId: '',
    dataPesagem: new Date().toISOString().split('T')[0],
    pesoKg: 450,
    observacao: ''
  });

  const [formEdit, setFormEdit] = useState({
    dataPesagem: '',
    pesoKg: 0,
    observacao: ''
  });

  const loadData = async (farmId?: string) => {
    setLoading(true);
    try {
      const activeId = farmId || selectedFarm?.id || selectedPropId;
      const [pesagensData, animaisData] = await Promise.all([
        pesagemService.listarTodas(undefined, activeId || undefined),
        animalService.listarTodos(activeId || undefined)
      ]);

      const listaAnimais = animaisData || [];
      setAnimais(listaAnimais);

      // Filtra por animais da fazenda caso aplicável
      if (activeId && listaAnimais.length > 0) {
        const animalIds = new Set(listaAnimais.map(a => a.id));
        const filtered = (pesagensData || []).filter(p => !p.animalId || animalIds.has(p.animalId));
        setPesagens(filtered);
      } else {
        setPesagens(pesagensData || []);
      }

      if (listaAnimais.length > 0 && listaAnimais[0].id) {
        setForm(f => ({ ...f, animalId: listaAnimais[0].id! }));
      }
    } catch (err) {
      console.error(err);
      setPesagens([]);
      setAnimais([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFarm?.id) {
      setSelectedPropId(selectedFarm.id);
      loadData(selectedFarm.id);
    } else if (propriedades.length > 0 && propriedades[0].id) {
      setSelectedPropId(propriedades[0].id);
      loadData(propriedades[0].id);
    } else {
      loadData();
    }
  }, [selectedFarm, propriedades]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.animalId) return alert('Selecione o animal.');
    if (form.pesoKg <= 0) return alert('O peso deve ser maior que zero.');

    try {
      await pesagemService.registrar({
        dataPesagem: form.dataPesagem,
        pesoKg: Number(form.pesoKg),
        observacao: form.observacao
      }, form.animalId);
      setModalOpen(false);
      setForm(f => ({
        ...f,
        dataPesagem: new Date().toISOString().split('T')[0],
        pesoKg: 450,
        observacao: ''
      }));
      loadData(selectedFarm?.id || selectedPropId);
      alert('Pesagem registrada e GMD calculado com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar pesagem.');
    }
  };

  const handleOpenEdit = (p: Pesagem) => {
    setEditingPesagem(p);
    setFormEdit({
      dataPesagem: p.dataPesagem || '',
      pesoKg: p.pesoKg || 0,
      observacao: p.observacao || ''
    });
    setModalEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPesagem?.id) return;
    if (formEdit.pesoKg <= 0) return alert('O peso deve ser maior que zero.');

    try {
      await pesagemService.atualizar(editingPesagem.id, {
        dataPesagem: formEdit.dataPesagem,
        pesoKg: Number(formEdit.pesoKg),
        observacao: formEdit.observacao
      });
      setModalEditOpen(false);
      setEditingPesagem(null);
      loadData(selectedFarm?.id || selectedPropId);
      alert('Pesagem atualizada com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar pesagem.');
    }
  };

  const handleDelete = async (p: Pesagem) => {
    if (!p.id) return;
    const confirmacao = window.confirm(`Deseja excluir a pesagem de ${p.pesoKg} kg do animal #${p.brincoAnimal || 'selecionado'} realizada em ${p.dataPesagem}?`);
    if (!confirmacao) return;

    try {
      await pesagemService.excluir(p.id);
      loadData(selectedFarm?.id || selectedPropId);
      alert('Pesagem excluída com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir pesagem.');
    }
  };

  // KPIs de Pesagem
  const totalPesagens = pesagens.length;
  const pesagensComGmd = pesagens.filter(p => p.gmdKgDia !== null && p.gmdKgDia !== undefined);
  const mediaPeso = totalPesagens > 0 
    ? Math.round(pesagens.reduce((acc, p) => acc + Number(p.pesoKg), 0) / totalPesagens) 
    : 0;
  
  const gmdMedio = pesagensComGmd.length > 0
    ? (pesagensComGmd.reduce((acc, p) => acc + Number(p.gmdKgDia), 0) / pesagensComGmd.length).toFixed(3)
    : '0.000';

  const altoGmdCount = pesagens.filter(p => p.gmdKgDia !== null && p.gmdKgDia !== undefined && Number(p.gmdKgDia) >= 1.0).length;
  const perdaPesoCount = pesagens.filter(p => p.gmdKgDia !== null && p.gmdKgDia !== undefined && Number(p.gmdKgDia) < 0).length;

  const filtered = pesagens.filter(p => {
    const matchesSearch = 
      (p.brincoAnimal && p.brincoAnimal.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.observacao && p.observacao.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'ALTO') {
      return p.gmdKgDia !== null && p.gmdKgDia !== undefined && Number(p.gmdKgDia) >= 1.0;
    }
    if (activeTab === 'MODERADO') {
      return p.gmdKgDia !== null && p.gmdKgDia !== undefined && Number(p.gmdKgDia) > 0 && Number(p.gmdKgDia) < 1.0;
    }
    if (activeTab === 'PERDA') {
      return p.gmdKgDia !== null && p.gmdKgDia !== undefined && Number(p.gmdKgDia) < 0;
    }
    if (activeTab === 'INICIAL') {
      return p.gmdKgDia === null || p.gmdKgDia === undefined;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-card border border-agro-border">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-agro-primary" />
            Controle de Pesagens & Ganho Médio Diário (GMD)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Aferição zootécnica com cálculo automatizado da curva de ganho: <span className="font-semibold text-agro-forest">(Peso Atual - Anterior) / Dias</span> (RN01).
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Lançar Nova Pesagem
        </button>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Pesagens</span>
            <History className="w-4 h-4 text-agro-primary" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalPesagens}</div>
          <div className="text-xs text-slate-500 mt-1">
            {animais.length} animais na propriedade
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Média de Peso</span>
            <Scale className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {mediaPeso} <span className="text-base font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Média histórica aferida
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">GMD Médio (RN01)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            +{gmdMedio} <span className="text-sm font-semibold text-emerald-600">kg/dia</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Taxa de conversão do rebanho
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-card transition-all ${
          perdaPesoCount > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Desempenho</span>
            {perdaPesoCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
            ) : (
              <Award className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            <span className="text-emerald-600">{altoGmdCount}</span>
            <span className="text-xs text-slate-400 font-normal mx-1.5">altos</span>
            {perdaPesoCount > 0 && (
              <span className="text-rose-600 font-bold"> / {perdaPesoCount} perda</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {perdaPesoCount > 0 ? 'Atenção a animais com perda' : 'Rebanho em ganho de peso'}
          </div>
        </div>
      </div>

      {/* SEARCH BAR, FAZENDA SELECTOR & FILTER TABS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número do brinco ou observação de manejo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
            />
          </div>

          <select
            value={selectedFarm?.id || selectedPropId}
            onChange={e => {
              setSelectedPropId(e.target.value);
              selectFarmById(e.target.value);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 cursor-pointer min-w-[220px]"
          >
            {propriedades.map(p => (
              <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
            ))}
          </select>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('TODAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TODAS' 
                ? 'bg-agro-forest text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas as Pesagens ({totalPesagens})
          </button>

          <button
            onClick={() => setActiveTab('ALTO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALTO' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Alto Desempenho (≥ 1.0 kg/d) ({altoGmdCount})
          </button>

          <button
            onClick={() => setActiveTab('MODERADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MODERADO' 
                ? 'bg-amber-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ganho Moderado (0 a 1.0 kg/d)
          </button>

          <button
            onClick={() => setActiveTab('PERDA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PERDA' 
                ? 'bg-rose-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Perda de Peso ({perdaPesoCount})
          </button>

          <button
            onClick={() => setActiveTab('INICIAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'INICIAL' 
                ? 'bg-slate-700 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Linha de Base / 1º Manejo
          </button>
        </div>
      </div>

      {/* TABELA DE PESAGENS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-agro-primary mb-2" />
            Carregando histórico de pesagens...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Scale className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            Nenhuma pesagem encontrada para o filtro selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-agro-secondary/40 text-agro-forest font-semibold border-b border-agro-secondary">
                <tr>
                  <th className="py-3.5 px-4">Animal (Brinco)</th>
                  <th className="py-3.5 px-4">Data Pesagem</th>
                  <th className="py-3.5 px-4">Peso Aferido</th>
                  <th className="py-3.5 px-4">Ganho Médio Diário (GMD)</th>
                  <th className="py-3.5 px-4">Intervalo</th>
                  <th className="py-3.5 px-4">Observações</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const gmdNum = p.gmdKgDia !== null && p.gmdKgDia !== undefined ? Number(p.gmdKgDia) : null;
                  return (
                    <tr key={p.id} className="hover:bg-agro-secondary/15 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-agro-primary shrink-0" />
                          <span className="bg-agro-secondary/50 text-agro-forest px-2 py-0.5 rounded-md font-bold">
                            #{p.brincoAnimal || 'BR-2026'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 font-medium">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {p.dataPesagem}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-base font-black text-slate-900">
                        {p.pesoKg} <span className="text-xs font-normal text-slate-500">kg</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {gmdNum !== null ? (
                          <span className={`inline-flex items-center font-bold px-2.5 py-1 rounded-full ${
                            gmdNum >= 1.0 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : gmdNum > 0 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-rose-100 text-rose-800'
                          }`}>
                            {gmdNum >= 0 ? (
                              <TrendingUp className="w-3.5 h-3.5 mr-1" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-600" />
                            )}
                            {gmdNum >= 0 ? `+${gmdNum.toFixed(3)}` : gmdNum.toFixed(3)} kg/dia
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs bg-slate-100 px-2 py-0.5 rounded">
                            Linha de Base / 1º Manejo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                        {p.diasEntrePesagens ? `${p.diasEntrePesagens} dias` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {p.observacao || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-agro-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar Pesagem"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Pesagem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL REGISTRAR PESAGEM */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-6 h-6 text-agro-primary" />
              Lançar Pesagem do Animal
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selecione o Animal</label>
                {animais.length === 0 ? (
                  <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
                    Nenhum animal cadastrado nesta fazenda. Cadastre animais na tela de Controle de Rebanho primeiro.
                  </div>
                ) : (
                  <select
                    required
                    value={form.animalId}
                    onChange={e => setForm({...form, animalId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  >
                    {animais.map(a => (
                      <option key={a.id} value={a.id}>
                        Brinco #{a.brinco} — {a.raca} {a.lote ? `(${a.lote})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data da Pesagem</label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={form.dataPesagem}
                    onChange={e => setForm({...form, dataPesagem: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peso Aferido (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={form.pesoKg}
                    onChange={e => setForm({...form, pesoKg: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-agro-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observação do Manejo</label>
                <textarea
                  rows={2}
                  value={form.observacao}
                  onChange={e => setForm({...form, observacao: e.target.value})}
                  placeholder="Ex: Pesagem de desmame, entrada em confinamento..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={animais.length === 0}
                  className="px-5 py-2 bg-agro-primary text-white font-semibold text-sm rounded-xl hover:bg-agro-primary-hover shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Salvar Pesagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PESAGEM */}
      {modalEditOpen && editingPesagem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-agro-primary" />
              Editar Pesagem — Brinco #{editingPesagem.brincoAnimal || 'Animal'}
            </h2>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data da Pesagem</label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={formEdit.dataPesagem}
                    onChange={e => setFormEdit({...formEdit, dataPesagem: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peso (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={formEdit.pesoKg}
                    onChange={e => setFormEdit({...formEdit, pesoKg: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-agro-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observação do Manejo</label>
                <textarea
                  rows={2}
                  value={formEdit.observacao}
                  onChange={e => setFormEdit({...formEdit, observacao: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-agro-primary text-white font-semibold text-sm rounded-xl hover:bg-agro-primary-hover shadow-xs cursor-pointer"
                >
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
