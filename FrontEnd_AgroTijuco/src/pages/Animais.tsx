import React, { useState, useEffect } from 'react';
import { animalService } from '../services/animalService';
import { pastagemService } from '../services/pastagemService';
import { useFarm } from '../contexts/FarmContext';
import type { Animal, BatchAnimalInput, Piquete } from '../types';
import { 
  Beef, 
  Plus, 
  Loader2, 
  Search, 
  Tag, 
  ShieldAlert, 
  Layers, 
  QrCode,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

type FilterTab = 'TODOS' | 'ATIVOS' | 'CARENCIA' | 'VENDIDOS' | 'ABATIDOS';

export const Animais: React.FC = () => {
  const { selectedFarm, propriedades, selectFarmById } = useFarm();
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [piquetes, setPiquetes] = useState<Piquete[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalIndividual, setModalIndividual] = useState<boolean>(false);
  const [modalLote, setModalLote] = useState<boolean>(false);
  const [modalEditar, setModalEditar] = useState<boolean>(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPropId, setSelectedPropId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<FilterTab>('TODOS');

  const [formIndividual, setFormIndividual] = useState({
    brinco: '',
    rfid: '',
    nome: '',
    lote: '',
    piqueteId: '',
    raca: 'Nelore',
    sexo: 'M' as 'M' | 'F',
    dataNascimento: new Date().toISOString().split('T')[0],
    status: 'ATIVO' as Animal['status']
  });

  const [formLote, setFormLote] = useState<BatchAnimalInput>({
    prefixoBrinco: '',
    quantidade: 10,
    sexo: 'M',
    raca: 'Nelore',
    lote: '',
    piqueteId: '',
    dataNascimento: new Date().toISOString().split('T')[0]
  });

  const [formEdicao, setFormEdicao] = useState({
    brinco: '',
    rfid: '',
    nome: '',
    lote: '',
    piqueteId: '',
    raca: 'Nelore',
    sexo: 'M' as 'M' | 'F',
    dataNascimento: '',
    status: 'ATIVO' as Animal['status']
  });

  const loadData = async (farmId?: string) => {
    setLoading(true);
    try {
      const activeId = farmId || selectedFarm?.id || selectedPropId;
      const [animaisData, piquetesData] = await Promise.all([
        animalService.listarTodos(activeId || undefined),
        activeId ? pastagemService.listarPorPropriedade(activeId).catch(() => []) : Promise.resolve([])
      ]);
      setAnimais(animaisData || []);
      setPiquetes(piquetesData || []);
    } catch (err) {
      console.error(err);
      setAnimais([]);
      setPiquetes([]);
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

  const handleCadastroIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPropId = selectedPropId || selectedFarm?.id;
    if (!targetPropId) return alert('Selecione uma fazenda.');
    try {
      await animalService.cadastrar({
        ...formIndividual,
        piqueteId: formIndividual.piqueteId || undefined
      }, targetPropId);
      setModalIndividual(false);
      setFormIndividual({
        brinco: '',
        rfid: '',
        nome: '',
        lote: '',
        piqueteId: '',
        raca: 'Nelore',
        sexo: 'M',
        dataNascimento: new Date().toISOString().split('T')[0],
        status: 'ATIVO'
      });
      loadData(targetPropId);
      alert('Animal cadastrado com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cadastrar animal.');
    }
  };

  const handleCadastroLote = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPropId = selectedPropId || selectedFarm?.id;
    if (!targetPropId) return alert('Selecione uma fazenda.');
    try {
      const novosAnimais = await animalService.cadastrarEmLote({
        ...formLote,
        piqueteId: formLote.piqueteId || undefined
      }, targetPropId);
      setModalLote(false);
      setFormLote({
        prefixoBrinco: '',
        quantidade: 10,
        sexo: 'M',
        raca: 'Nelore',
        lote: '',
        piqueteId: '',
        dataNascimento: new Date().toISOString().split('T')[0]
      });
      loadData(targetPropId);
      alert(`Lote de ${novosAnimais.length} animais cadastrado com sucesso!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro no cadastro em lote.');
    }
  };

  const handleAbrirEdicao = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormEdicao({
      brinco: animal.brinco || '',
      rfid: animal.rfid || '',
      nome: animal.nome || '',
      lote: animal.lote || '',
      piqueteId: animal.piqueteId || '',
      raca: animal.raca || 'Nelore',
      sexo: (animal.sexo === 'FEMEA' || animal.sexo === 'F') ? 'F' : 'M',
      dataNascimento: animal.dataNascimento ? animal.dataNascimento.split('T')[0] : '',
      status: animal.status || 'ATIVO'
    });
    setModalEditar(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnimal?.id) return;
    const targetPropId = selectedFarm?.id || selectedPropId;
    try {
      await animalService.atualizar(editingAnimal.id, {
        ...formEdicao,
        piqueteId: formEdicao.piqueteId || undefined
      });
      setModalEditar(false);
      setEditingAnimal(null);
      loadData(targetPropId);
      alert(`Animal #${formEdicao.brinco} atualizado com sucesso!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar dados do animal.');
    }
  };

  const handleExcluirAnimal = async (animal: Animal) => {
    if (!animal.id) return;
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o animal #${animal.brinco} (${animal.raca})?\nEsta ação removerá o registro.`);
    if (!confirmacao) return;

    const targetPropId = selectedFarm?.id || selectedPropId;
    try {
      await animalService.excluir(animal.id);
      loadData(targetPropId);
      alert(`Animal #${animal.brinco} excluído com sucesso!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Não foi possível excluir o animal. Verifique se há pesagens ou manejos associados.');
    }
  };

  const handleMudarStatus = async (animal: Animal, novoStatus: Animal['status']) => {
    if (!animal.id) return;
    const targetPropId = selectedFarm?.id || selectedPropId;

    if (animal.emCarenciaSanitaria && (novoStatus === 'VENDIDO' || novoStatus === 'ABATIDO')) {
      alert(`BLOQUEIO SANITÁRIO (RN02): O animal #${animal.brinco} está em período de carência ativa até ${animal.dataFimCarencia}. É proibida a venda ou abate neste período.`);
      return;
    }

    try {
      await animalService.atualizarStatus(animal.id, novoStatus);
      loadData(targetPropId);
      alert(`Status do animal #${animal.brinco} alterado para ${novoStatus}!`);
    } catch (err: any) {
      alert(err.response?.data?.message || `Bloqueio Sanitário: Não foi possível alterar o status do animal #${animal.brinco}.`);
    }
  };

  // Métricas de Rebanho
  const totalAnimais = animais.length;
  const ativosCount = animais.filter(a => a.status === 'ATIVO').length;
  const carenciaCount = animais.filter(a => a.emCarenciaSanitaria).length;
  const machosCount = animais.filter(a => a.sexo === 'M' || a.sexo === 'MACHO').length;
  const femeasCount = animais.filter(a => a.sexo === 'F' || a.sexo === 'FEMEA').length;
  const vendidosCount = animais.filter(a => a.status === 'VENDIDO').length;
  const abatidosCount = animais.filter(a => a.status === 'ABATIDO').length;

  const filtered = animais.filter((a) => {
    const matchesSearch =
      a.brinco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.rfid && a.rfid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.nome && a.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.raca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.lote && a.lote.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'ATIVOS') return a.status === 'ATIVO';
    if (activeTab === 'CARENCIA') return a.emCarenciaSanitaria === true;
    if (activeTab === 'VENDIDOS') return a.status === 'VENDIDO';
    if (activeTab === 'ABATIDOS') return a.status === 'ABATIDO';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-card border border-agro-border">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Beef className="w-7 h-7 text-agro-primary" />
            Controle de Rebanho & Identificação
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Cadastro individual e em lote de animais, brincos visíveis, RFID eletrônico e controle de carência sanitária (RN02).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalLote(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-agro-secondary text-agro-forest hover:bg-agro-secondary/80 font-bold text-sm shadow-xs transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 mr-1.5" />
            Cadastro em Lote
          </button>

          <button
            onClick={() => setModalIndividual(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Animal
          </button>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total do Rebanho</span>
            <Beef className="w-4 h-4 text-agro-primary" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalAnimais}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-emerald-600">{ativosCount}</span> ativos na fazenda
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Sexo (M / F)</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            <span className="text-blue-600">{machosCount}M</span> / <span className="text-rose-500">{femeasCount}F</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Distribuição reprodutiva
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-card transition-all ${
          carenciaCount > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Em Carência (RN02)</span>
            <ShieldAlert className={`w-4 h-4 ${carenciaCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold ${carenciaCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {carenciaCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {carenciaCount > 0 ? 'Bloqueados p/ abate/venda' : 'Nenhum bloqueio ativo'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Comercializados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {vendidosCount + abatidosCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="text-blue-600 font-semibold">{vendidosCount}</span> vendidos • <span className="text-amber-600 font-semibold">{abatidosCount}</span> abatidos
          </div>
        </div>
      </div>

      {/* FILTER TABS, SEARCH BAR & FAZENDA SELECTOR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número do brinco, TAG RFID, lote, nome ou raça..."
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
            onClick={() => setActiveTab('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TODOS' 
                ? 'bg-agro-forest text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({totalAnimais})
          </button>

          <button
            onClick={() => setActiveTab('ATIVOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ATIVOS' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ativos ({ativosCount})
          </button>

          <button
            onClick={() => setActiveTab('CARENCIA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CARENCIA' 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Em Carência ({carenciaCount})
          </button>

          <button
            onClick={() => setActiveTab('VENDIDOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'VENDIDOS' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Vendidos ({vendidosCount})
          </button>

          <button
            onClick={() => setActiveTab('ABATIDOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ABATIDOS' 
                ? 'bg-amber-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Abatidos ({abatidosCount})
          </button>
        </div>
      </div>

      {/* TABELA DE ANIMAIS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-agro-primary mb-2" />
            Carregando rebanho...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Beef className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            Nenhum animal encontrado para o filtro selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-agro-secondary/40 text-agro-forest font-semibold border-b border-agro-secondary">
                <tr>
                  <th className="py-3.5 px-4">Brinco / Identificação</th>
                  <th className="py-3.5 px-4">RFID Eletrônico</th>
                  <th className="py-3.5 px-4">Lote / Piquete</th>
                  <th className="py-3.5 px-4">Raça & Sexo</th>
                  <th className="py-3.5 px-4">Status & Carência</th>
                  <th className="py-3.5 px-4 text-right">Ações & Manejo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((animal) => (
                  <tr key={animal.id} className="hover:bg-agro-secondary/15 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-agro-primary mr-2 shrink-0" />
                        <div>
                          <span className="font-mono bg-agro-secondary/50 text-agro-forest px-2 py-0.5 rounded-md font-bold">
                            #{animal.brinco}
                          </span>
                          {animal.nome && (
                            <span className="block text-xs text-slate-500 font-normal mt-0.5">{animal.nome}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {animal.rfid ? (
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <QrCode className="w-3 h-3 text-slate-500" />
                          {animal.rfid}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">Sem RFID</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-800 block">{animal.lote || 'Sem Lote'}</span>
                      <span className="text-[11px] text-slate-500">{animal.nomePiquete || 'Pasto não atribuído'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-800">{animal.raca}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        animal.sexo === 'M' || animal.sexo === 'MACHO' ? 'bg-blue-50 text-blue-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {animal.sexo === 'M' || animal.sexo === 'MACHO' ? 'Macho' : 'Fêmea'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs space-y-1">
                      {/* Badge do Status Principal */}
                      <div>
                        {animal.status === 'ATIVO' && (
                          <span className="inline-flex items-center bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2 py-0.5 rounded-md">
                            Ativo
                          </span>
                        )}
                        {animal.status === 'VENDIDO' && (
                          <span className="inline-flex items-center bg-blue-100 text-blue-800 font-bold text-[11px] px-2 py-0.5 rounded-md">
                            Vendido
                          </span>
                        )}
                        {animal.status === 'ABATIDO' && (
                          <span className="inline-flex items-center bg-amber-100 text-amber-800 font-bold text-[11px] px-2 py-0.5 rounded-md">
                            Abatido
                          </span>
                        )}
                        {animal.status === 'MORTO' && (
                          <span className="inline-flex items-center bg-slate-100 text-slate-700 font-bold text-[11px] px-2 py-0.5 rounded-md">
                            Morto
                          </span>
                        )}
                        {animal.status === 'EM_TRATAMENTO' && (
                          <span className="inline-flex items-center bg-purple-100 text-purple-800 font-bold text-[11px] px-2 py-0.5 rounded-md">
                            Em Tratamento
                          </span>
                        )}
                      </div>

                      {/* Badge de Carência Sanitária */}
                      <div>
                        {animal.emCarenciaSanitaria ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[11px] rounded-md animate-pulse">
                            <ShieldAlert className="w-3 h-3" /> Carência até {animal.dataFimCarencia}
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium">
                            ✓ Sem carência sanitária
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Vender / Abater (para ativos) */}
                      {animal.status === 'ATIVO' && (
                        <>
                          <button
                            onClick={() => handleMudarStatus(animal, 'VENDIDO')}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            title="Registrar Venda do Animal"
                          >
                            Vender
                          </button>
                          <button
                            onClick={() => handleMudarStatus(animal, 'ABATIDO')}
                            className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            title="Registrar Abate do Animal"
                          >
                            Abater
                          </button>
                        </>
                      )}

                      {/* Reativar (caso vendido ou abatido por engano) */}
                      {(animal.status === 'VENDIDO' || animal.status === 'ABATIDO' || animal.status === 'MORTO') && (
                        <button
                          onClick={() => handleMudarStatus(animal, 'ATIVO')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Reativar animal para o rebanho ativo"
                        >
                          <RotateCcw className="w-3 h-3" /> Reativar
                        </button>
                      )}

                      {/* Editar Animal */}
                      <button
                        onClick={() => handleAbrirEdicao(animal)}
                        className="p-1.5 text-slate-500 hover:text-agro-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar Informações do Animal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Excluir Animal */}
                      <button
                        onClick={() => handleExcluirAnimal(animal)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir Animal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CADASTRO INDIVIDUAL */}
      {modalIndividual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Beef className="w-5 h-5 text-agro-primary" />
              Cadastrar Animal Individual
            </h2>
            <form onSubmit={handleCadastroIndividual} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fazenda / Propriedade</label>
                <select
                  required
                  value={selectedPropId}
                  onChange={e => {
                    setSelectedPropId(e.target.value);
                    pastagemService.listarPorPropriedade(e.target.value).then(setPiquetes).catch(() => setPiquetes([]));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <option value="">Selecione a fazenda...</option>
                  {propriedades.map(p => (
                    <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brinco Visível (Obrigatório)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1045"
                    value={formIndividual.brinco}
                    onChange={e => setFormIndividual({...formIndividual, brinco: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome / Apelido (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Estrela, Touro 01"
                    value={formIndividual.nome}
                    onChange={e => setFormIndividual({...formIndividual, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">TAG RFID Eletrônico (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: 982000123456789"
                  value={formIndividual.rfid}
                  onChange={e => setFormIndividual({...formIndividual, rfid: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Raça</label>
                  <input
                    type="text"
                    required
                    value={formIndividual.raca}
                    onChange={e => setFormIndividual({...formIndividual, raca: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={formIndividual.sexo}
                    onChange={e => setFormIndividual({...formIndividual, sexo: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="M">Macho</option>
                    <option value="F">Fêmea</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lote de Manejo</label>
                  <input
                    type="text"
                    placeholder="Ex: Recria 2026"
                    value={formIndividual.lote}
                    onChange={e => setFormIndividual({...formIndividual, lote: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Piquete / Pasto</label>
                  <select
                    value={formIndividual.piqueteId}
                    onChange={e => setFormIndividual({...formIndividual, piqueteId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">Nenhum piquete</option>
                    {piquetes.map(piq => (
                      <option key={piq.id} value={piq.id}>{piq.nomePiquete}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={formIndividual.dataNascimento}
                  onChange={e => setFormIndividual({...formIndividual, dataNascimento: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalIndividual(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-agro-primary text-white font-semibold text-sm rounded-xl hover:bg-agro-primary-hover shadow-xs cursor-pointer"
                >
                  Salvar Animal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CADASTRO EM LOTE */}
      {modalLote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-agro-primary" />
              Cadastro em Lote de Animais
            </h2>
            <p className="text-xs text-slate-500">
              Crie rapidamente dezenas de animais com numeração sequencial automática (Ex: NEL-001, NEL-002...).
            </p>
            <form onSubmit={handleCadastroLote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fazenda / Propriedade</label>
                <select
                  required
                  value={selectedPropId}
                  onChange={e => {
                    setSelectedPropId(e.target.value);
                    pastagemService.listarPorPropriedade(e.target.value).then(setPiquetes).catch(() => setPiquetes([]));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <option value="">Selecione a fazenda...</option>
                  {propriedades.map(p => (
                    <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prefixo do Brinco</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BEZ-2026"
                    value={formLote.prefixoBrinco}
                    onChange={e => setFormLote({...formLote, prefixoBrinco: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade de Animais</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={formLote.quantidade}
                    onChange={e => setFormLote({...formLote, quantidade: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-agro-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Raça do Lote</label>
                  <input
                    type="text"
                    required
                    value={formLote.raca}
                    onChange={e => setFormLote({...formLote, raca: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={formLote.sexo}
                    onChange={e => setFormLote({...formLote, sexo: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="M">Macho</option>
                    <option value="F">Fêmea</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Lote</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Garrotes Recria"
                    value={formLote.lote}
                    onChange={e => setFormLote({...formLote, lote: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Piquete / Pasto</label>
                  <select
                    value={formLote.piqueteId || ''}
                    onChange={e => setFormLote({...formLote, piqueteId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">Nenhum piquete</option>
                    {piquetes.map(piq => (
                      <option key={piq.id} value={piq.id}>{piq.nomePiquete}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data de Nascimento Estimada</label>
                <input
                  type="date"
                  value={formLote.dataNascimento}
                  onChange={e => setFormLote({...formLote, dataNascimento: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalLote(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-agro-primary text-white font-semibold text-sm rounded-xl hover:bg-agro-primary-hover shadow-xs cursor-pointer"
                >
                  Gerar Lote ({formLote.quantidade} Animais)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR ANIMAL */}
      {modalEditar && editingAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-agro-primary" />
                Editar Animal #{editingAnimal.brinco}
              </h2>
              {editingAnimal.emCarenciaSanitaria && (
                <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3.5 h-3.5" /> Carência Ativa
                </span>
              )}
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número do Brinco</label>
                  <input
                    type="text"
                    required
                    value={formEdicao.brinco}
                    onChange={e => setFormEdicao({...formEdicao, brinco: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome / Apelido</label>
                  <input
                    type="text"
                    placeholder="Ex: Touro Campeão"
                    value={formEdicao.nome}
                    onChange={e => setFormEdicao({...formEdicao, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">TAG RFID Eletrônico</label>
                <input
                  type="text"
                  placeholder="Ex: 982000123456789"
                  value={formEdicao.rfid}
                  onChange={e => setFormEdicao({...formEdicao, rfid: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Raça</label>
                  <input
                    type="text"
                    required
                    value={formEdicao.raca}
                    onChange={e => setFormEdicao({...formEdicao, raca: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={formEdicao.sexo}
                    onChange={e => setFormEdicao({...formEdicao, sexo: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="M">Macho</option>
                    <option value="F">Fêmea</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lote de Manejo</label>
                  <input
                    type="text"
                    value={formEdicao.lote}
                    onChange={e => setFormEdicao({...formEdicao, lote: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Piquete / Pasto</label>
                  <select
                    value={formEdicao.piqueteId}
                    onChange={e => setFormEdicao({...formEdicao, piqueteId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">Nenhum piquete</option>
                    {piquetes.map(piq => (
                      <option key={piq.id} value={piq.id}>{piq.nomePiquete}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formEdicao.dataNascimento}
                    onChange={e => setFormEdicao({...formEdicao, dataNascimento: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status do Animal</label>
                  <select
                    value={formEdicao.status}
                    onChange={e => setFormEdicao({...formEdicao, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="EM_TRATAMENTO">Em Tratamento</option>
                    <option value="VENDIDO">Vendido</option>
                    <option value="ABATIDO">Abatido</option>
                    <option value="MORTO">Morto</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditar(false)}
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
