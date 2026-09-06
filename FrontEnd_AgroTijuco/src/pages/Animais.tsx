import React, { useState, useEffect } from 'react';
import { animalService } from '../services/animalService';
import { useFarm } from '../contexts/FarmContext';
import type { Animal, BatchAnimalInput } from '../types';
import { 
  Beef, 
  Plus, 
  Loader2, 
  Search, 
  Tag, 
  ShieldAlert, 
  Layers, 
  QrCode 
} from 'lucide-react';

export const Animais: React.FC = () => {
  const { selectedFarm, propriedades, selectFarmById } = useFarm();
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalIndividual, setModalIndividual] = useState<boolean>(false);
  const [modalLote, setModalLote] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPropId, setSelectedPropId] = useState<string>('');

  const [formIndividual, setFormIndividual] = useState({
    brinco: '',
    rfid: '',
    lote: '',
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
    dataNascimento: new Date().toISOString().split('T')[0]
  });

  const loadData = async (farmId?: string) => {
    setLoading(true);
    try {
      const activeId = farmId || selectedFarm?.id || selectedPropId;
      const animaisData = await animalService.listarTodos(activeId || undefined);
      setAnimais(animaisData || []);
    } catch (err) {
      console.error(err);
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

  const handleCadastroIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPropId = selectedFarm?.id || selectedPropId;
    if (!targetPropId) return alert('Selecione uma fazenda.');
    try {
      await animalService.cadastrar(formIndividual, targetPropId);
      setModalIndividual(false);
      loadData(targetPropId);
      alert('Animal cadastrado com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cadastrar animal.');
    }
  };

  const handleCadastroLote = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPropId = selectedFarm?.id || selectedPropId;
    if (!targetPropId) return alert('Selecione uma fazenda.');
    try {
      const novoseAnimais = await animalService.cadastrarEmLote(formLote, targetPropId);
      setModalLote(false);
      loadData(targetPropId);
      alert(`Lote de ${novoseAnimais.length} animais cadastrado com sucesso!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro no cadastro em lote.');
    }
  };

  const handleMudarStatus = async (animal: Animal, novoStatus: Animal['status']) => {
    if (!animal.id) return;
    const targetPropId = selectedFarm?.id || selectedPropId;
    try {
      await animalService.atualizarStatus(animal.id, novoStatus);
      loadData(targetPropId);
      alert(`Status do animal ${animal.brinco} alterado para ${novoStatus}!`);
    } catch (err: any) {
      alert(err.response?.data?.message || `Bloqueio Sanitário: Não foi possível alterar o status do animal ${animal.brinco} pois está em período de carência.`);
    }
  };

  const filtered = animais.filter(
    (a) =>
      a.brinco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.rfid && a.rfid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.raca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.lote && a.lote.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            Cadastro individual ou em lote de animais, brincos visíveis, tags eletrônicas RFID e controle de carência sanitária.
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
            Novo Animal Individual
          </button>
        </div>
      </div>

      {/* SEARCH BAR & FAZENDA FILTER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número do brinco, TAG RFID, lote ou raça..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
          />
        </div>

        <select
          value={selectedFarm?.id || selectedPropId}
          onChange={e => {
            setSelectedPropId(e.target.value);
            selectFarmById(e.target.value);
          }}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer"
        >
          {propriedades.map(p => (
            <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
          ))}
        </select>
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
            Nenhum animal encontrado para o filtro digitado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-agro-secondary/40 text-agro-forest font-semibold border-b border-agro-secondary">
                <tr>
                  <th className="py-3.5 px-4">Brinco Visível</th>
                  <th className="py-3.5 px-4">RFID Eletrônico</th>
                  <th className="py-3.5 px-4">Lote / Piquete</th>
                  <th className="py-3.5 px-4">Raça & Sexo</th>
                  <th className="py-3.5 px-4">Status Sanitário</th>
                  <th className="py-3.5 px-4 text-right">Ações de Manejo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((animal) => (
                  <tr key={animal.id} className="hover:bg-agro-secondary/15 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-agro-primary mr-2 shrink-0" />
                        <span className="font-mono bg-agro-secondary/50 text-agro-forest px-2 py-0.5 rounded-md font-bold">
                          #{animal.brinco}
                        </span>
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
                      <span className="text-[11px] text-slate-500">{animal.nomePiquete || 'Pasto Principal'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-800">{animal.raca}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        animal.sexo === 'M' || animal.sexo === 'MACHO' ? 'bg-blue-50 text-blue-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {animal.sexo === 'M' || animal.sexo === 'MACHO' ? 'Macho' : 'Fêmea'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {animal.emCarenciaSanitaria ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 font-bold text-xs rounded-lg animate-pulse">
                          <ShieldAlert className="w-3.5 h-3.5" /> Em Carência até {animal.dataFimCarencia}
                        </span>
                      ) : (
                        <span className="inline-flex items-center bg-emerald-50 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-lg">
                          ✓ Liberado para Venda/Abate
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleMudarStatus(animal, 'VENDIDO')}
                        className="px-2 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded hover:bg-blue-200 cursor-pointer"
                        title="Marcar como Vendido"
                      >
                        Vender
                      </button>
                      <button
                        onClick={() => handleMudarStatus(animal, 'ABATIDO')}
                        className="px-2 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded hover:bg-amber-200 cursor-pointer"
                        title="Marcar como Abatido"
                      >
                        Abater
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Cadastrar Animal Individual</h2>
            <form onSubmit={handleCadastroIndividual} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fazenda / Propriedade</label>
                <select
                  required
                  value={selectedPropId}
                  onChange={e => setSelectedPropId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <option value="">Selecione a fazenda...</option>
                  {propriedades.map(p => (
                    <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brinco Visível (Obrigatório)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1045"
                  value={formIndividual.brinco}
                  onChange={e => setFormIndividual({...formIndividual, brinco: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
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

              <div className="grid grid-cols-2 gap-2">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lote de Manejo</label>
                <input
                  type="text"
                  placeholder="Ex: Lote 1 - Recria"
                  value={formIndividual.lote}
                  onChange={e => setFormIndividual({...formIndividual, lote: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalIndividual(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agro-primary text-white font-semibold text-sm rounded-xl hover:bg-agro-primary-hover shadow-xs"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-agro-primary" />
              Cadastro em Lote de Animais
            </h2>
            <form onSubmit={handleCadastroLote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fazenda / Propriedade</label>
                <select
                  required
                  value={selectedPropId}
                  onChange={e => setSelectedPropId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <option value="">Selecione a fazenda...</option>
                  {propriedades.map(p => (
                    <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
                  ))}
                </select>
              </div>

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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade de Animais</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formLote.quantidade}
                    onChange={e => setFormLote({...formLote, quantidade: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-agro-forest"
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalLote(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agro-primary text-white font-semibold text-sm rounded-xl hover:bg-agro-primary-hover shadow-xs"
                >
                  Gerar Lote ({formLote.quantidade} Animais)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
