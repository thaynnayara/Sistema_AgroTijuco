import React, { useState, useEffect } from 'react';
import { Syringe, AlertTriangle, ShieldAlert, Plus } from 'lucide-react';
import type { RegistroSanitario, Animal } from '../types';
import { sanitarioService } from '../services/sanitarioService';
import { animalService } from '../services/animalService';
import { useFarm } from '../contexts/FarmContext';

export const Sanidade: React.FC = () => {
  const { selectedFarm } = useFarm();
  const [carencias, setCarencias] = useState<RegistroSanitario[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [modalAberta, setModalAberta] = useState(false);
  const [form, setForm] = useState({
    animalId: '',
    lote: '',
    medicamentoVacina: '',
    tipo: 'VACINA' as RegistroSanitario['tipo'],
    dose: '2 ml',
    dataAplicacao: new Date().toISOString().split('T')[0],
    diasCarencia: 30,
    observacao: ''
  });

  const carregarDados = async (farmId?: string) => {
    try {
      const activeId = farmId || selectedFarm?.id;
      const [listCarencias, listAnimais] = await Promise.all([
        sanitarioService.listarCarenciasAtivas(),
        animalService.listarTodos(activeId || undefined)
      ]);

      setAnimais(listAnimais || []);

      if (activeId && listAnimais && listAnimais.length > 0) {
        const animalIds = new Set(listAnimais.map(a => a.id));
        const filteredCarencias = (listCarencias || []).filter(c => !c.animalId || animalIds.has(c.animalId));
        setCarencias(filteredCarencias);
      } else {
        setCarencias(listCarencias || []);
      }
    } catch (err) {
      console.error(err);
      setCarencias([]);
      setAnimais([]);
    }
  };

  useEffect(() => {
    carregarDados(selectedFarm?.id);
  }, [selectedFarm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sanitarioService.registrar({
        animalId: form.animalId || undefined,
        lote: form.lote || undefined,
        medicamentoVacina: form.medicamentoVacina,
        tipo: form.tipo,
        dose: form.dose,
        dataAplicacao: form.dataAplicacao,
        diasCarencia: Number(form.diasCarencia),
        observacao: form.observacao
      });
      setModalAberta(false);
      carregarDados(selectedFarm?.id);
      alert('Aplicação sanitária registrada com sucesso!');
    } catch (err) {
      alert('Erro ao registrar vacina/medicamento.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-card border border-agro-border">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Syringe className="w-7 h-7 text-agro-primary" />
            Calendário Sanitário & Carência
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manejos sanitários, vermifugações e bloqueio automático de venda/abate durante o período de carência
          </p>
        </div>

        <button
          onClick={() => setModalAberta(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Lançar Vacina / Medicamento</span>
        </button>
      </div>

      {/* BANNER CARÊNCIA SANITÁRIA */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
        <div className="p-3 bg-red-100 rounded-xl text-red-700">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-red-900 flex items-center gap-2">
            Controle de Carência Sanitária
          </h2>
          <p className="text-xs text-red-800 mt-1 leading-relaxed">
            Animais com vacinas ou medicamentos aplicados recentemente entram automaticamente em período de carência e ficam protegidos contra venda ou abate até o término do prazo.
          </p>
        </div>
      </div>

      {/* ANIMAIS EM CARÊNCIA ATIVA */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-agro-border space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Animais em Período de Carência Sanitária Ativa ({carencias.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Animal / Lote</th>
                <th className="px-4 py-3">Medicamento / Vacina</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Data Aplicação</th>
                <th className="px-4 py-3">Dias Carência</th>
                <th className="px-4 py-3">Término da Carência</th>
                <th className="px-4 py-3">Status Venda/Abate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carencias.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400 italic">
                    Nenhum animal em período de carência ativas no momento.
                  </td>
                </tr>
              ) : (
                carencias.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {c.brincoAnimal ? `Brinco #${c.brincoAnimal}` : `Lote: ${c.lote}`}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{c.medicamentoVacina}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                        {c.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">{c.dataAplicacao}</td>
                    <td className="px-4 py-3 font-semibold">{c.diasCarencia} dias</td>
                    <td className="px-4 py-3 font-bold text-red-600">{c.dataFimCarencia}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg">
                        <ShieldAlert className="w-3.5 h-3.5" /> BLOQUEADO
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalAberta && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Registrar Aplicação Sanitária</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selecione o Animal (Ou deixe em branco para Lote)</label>
                <select
                  value={form.animalId}
                  onChange={e => setForm({...form, animalId: e.target.value, lote: ''})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">-- Aplicação por Lote --</option>
                  {animais.map(a => (
                    <option key={a.id} value={a.id}>Brinco #{a.brinco} ({a.raca})</option>
                  ))}
                </select>
              </div>

              {!form.animalId && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Lote</label>
                  <input
                    type="text"
                    value={form.lote}
                    onChange={e => setForm({...form, lote: e.target.value})}
                    placeholder="Ex: Lote Bezerros Desmama 2026"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Medicamento / Vacina</label>
                <input
                  type="text"
                  required
                  value={form.medicamentoVacina}
                  onChange={e => setForm({...form, medicamentoVacina: e.target.value})}
                  placeholder="Ex: Vacina Aftosa, Ivermectina 3.15%"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={e => setForm({...form, tipo: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="VACINA">Vacina</option>
                    <option value="VERMIFUGO">Vermífugo</option>
                    <option value="ANTIBIOTICO">Antibiótico</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dias de Carência</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.diasCarencia}
                    onChange={e => setForm({...form, diasCarencia: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberta(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agro-primary text-white font-semibold text-sm rounded-xl hover:bg-agro-primary-hover shadow-xs"
                >
                  Registrar Manejo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
