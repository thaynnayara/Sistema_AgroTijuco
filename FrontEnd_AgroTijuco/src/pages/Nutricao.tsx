import React, { useState, useEffect } from 'react';
import { Apple, Plus, Utensils } from 'lucide-react';
import type { DietaTrato, Propriedade } from '../types';
import { nutricaoService } from '../services/nutricaoService';
import { propriedadeService } from '../services/propriedadeService';

export const Nutricao: React.FC = () => {
  const [dietas, setDietas] = useState<DietaTrato[]>([]);
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [propriedadeId, setPropriedadeId] = useState<string>('');
  const [modalAberta, setModalAberta] = useState(false);

  const [form, setForm] = useState({
    nomeDieta: 'Ração de Engorda Confinamento 18% PB',
    ingredientes: 'Milho Moído (60%), Farelo de Soja (25%), Núcleo Mineral Bovino (5%), Silagem de Milho (10%)',
    quantidadeKgCabeca: 4.5,
    loteDestino: 'Lote Boi Gordo Recria',
    dataTrato: new Date().toISOString().split('T')[0],
    observacoes: 'Fornecer em 2 tratos diários (07:00h e 16:00h).'
  });

  useEffect(() => {
    carregarPropriedades();
  }, []);

  const carregarPropriedades = async () => {
    try {
      const list = await propriedadeService.listarTodas();
      setPropriedades(list);
      if (list.length > 0 && list[0].id) {
        setPropriedadeId(list[0].id);
        carregarDietas(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const carregarDietas = async (pId: string) => {
    try {
      const list = await nutricaoService.listarPorPropriedade(pId);
      setDietas(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propriedadeId) return alert('Selecione uma fazenda.');
    try {
      await nutricaoService.registrar(propriedadeId, form);
      setModalAberta(false);
      carregarDietas(propriedadeId);
    } catch (err) {
      alert('Erro ao registrar dieta.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-card border border-agro-border">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Apple className="w-7 h-7 text-agro-primary" />
            Controle Nutricional & Trato Diário (RF06)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Formulação de dietas, suplementação mineral e controle de trato aos lotes de confinamento/recria
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={propriedadeId}
            onChange={e => {
              setPropriedadeId(e.target.value);
              carregarDietas(e.target.value);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
          >
            {propriedades.map(p => (
              <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
            ))}
          </select>

          <button
            onClick={() => setModalAberta(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Formular Nova Dieta</span>
          </button>
        </div>
      </div>

      {/* DIETAS LIST */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-agro-border space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-agro-primary" />
          Dietas e Tratos Registrados
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nome da Dieta</th>
                <th className="px-4 py-3">Lote Destino</th>
                <th className="px-4 py-3">Qtd (kg/cabeça)</th>
                <th className="px-4 py-3">Composição / Ingredientes</th>
                <th className="px-4 py-3">Data Trato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dietas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                    Nenhuma dieta formulada para esta fazenda.
                  </td>
                </tr>
              ) : (
                dietas.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{d.nomeDieta}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-semibold text-xs rounded-lg">
                        {d.loteDestino || 'Geral'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-agro-forest">{d.quantidadeKgCabeca} kg/cab</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">{d.ingredientes}</td>
                    <td className="px-4 py-3">{d.dataTrato}</td>
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
            <h3 className="text-lg font-bold text-slate-800">Formular Nova Dieta do Trato</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Dieta</label>
                <input
                  type="text"
                  required
                  value={form.nomeDieta}
                  onChange={e => setForm({...form, nomeDieta: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lote Destino</label>
                <input
                  type="text"
                  value={form.loteDestino}
                  onChange={e => setForm({...form, loteDestino: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade Diária (kg / cabeça)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.quantidadeKgCabeca}
                  onChange={e => setForm({...form, quantidadeKgCabeca: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ingredientes & Percentuais</label>
                <textarea
                  rows={2}
                  required
                  value={form.ingredientes}
                  onChange={e => setForm({...form, ingredientes: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
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
                  Salvar Dieta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
