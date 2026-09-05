import React, { useState, useEffect } from 'react';
import { pesagemService } from '../services/pesagemService';
import { animalService } from '../services/animalService';
import type { Pesagem, Animal } from '../types';
import { 
  Scale, 
  Plus, 
  Loader2, 
  Search, 
  TrendingUp, 
  Calendar, 
  Tag 
} from 'lucide-react';

export const Pesagens: React.FC = () => {
  const [pesagens, setPesagens] = useState<Pesagem[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [form, setForm] = useState({
    animalId: '',
    dataPesagem: new Date().toISOString().split('T')[0],
    pesoKg: 450,
    observacao: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pesagensData, animaisData] = await Promise.all([
        pesagemService.listarTodas(),
        animalService.listarTodos()
      ]);
      setPesagens(pesagensData);
      setAnimais(animaisData);
      if (animaisData.length > 0 && animaisData[0].id) {
        setForm(f => ({ ...f, animalId: animaisData[0].id! }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.animalId) return alert('Selecione o animal.');
    try {
      await pesagemService.registrar({
        dataPesagem: form.dataPesagem,
        pesoKg: Number(form.pesoKg),
        observacao: form.observacao
      }, form.animalId);
      setModalOpen(false);
      loadData();
      alert('Pesagem registrada com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar pesagem.');
    }
  };

  const filtered = pesagens.filter(p => 
    (p.brincoAnimal && p.brincoAnimal.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.observacao && p.observacao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            Cálculo automático do Ganho Médio Diário: <span className="font-semibold text-agro-forest">(Peso Atual - Peso Anterior) / Dias decorridos</span>
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

      {/* BANNER GMD */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-emerald-600 shrink-0" />
        <div className="text-xs text-emerald-900">
          <span className="font-bold block text-sm">Cálculo Automático do GMD</span>
          Ao registrar uma nova pesagem, o sistema busca a pesagem anterior do mesmo animal e calcula a taxa de ganho em kg/dia.
        </div>
      </div>

      {/* FILTRO DE BUSCA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número do brinco ou observação de manejo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
          />
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
            Nenhuma pesagem encontrada.
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-agro-primary" />
                        <span>#{p.brincoAnimal || 'BR-2026'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {p.dataPesagem}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-base font-black text-slate-900">
                      {p.pesoKg} kg
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {p.gmdKgDia ? (
                        <span className={`inline-flex items-center font-bold px-2.5 py-1 rounded-full ${
                          p.gmdKgDia > 1.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          +{p.gmdKgDia} kg/dia
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pesagem Inicial</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                      {p.diasEntrePesagens ? `${p.diasEntrePesagens} dias` : '1º manejo'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {p.observacao || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
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
                <select
                  value={form.animalId}
                  onChange={e => setForm({...form, animalId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  {animais.map(a => (
                    <option key={a.id} value={a.id}>Brinco #{a.brinco} ({a.raca})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Pesagem</label>
                  <input
                    type="date"
                    required
                    value={form.dataPesagem}
                    onChange={e => setForm({...form, dataPesagem: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peso (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
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
                  placeholder="Pesagem de acompanhamento de confinamento..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agro-primary text-white font-semibold text-sm rounded-xl hover:bg-agro-primary-hover shadow-xs"
                >
                  Salvar Pesagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
