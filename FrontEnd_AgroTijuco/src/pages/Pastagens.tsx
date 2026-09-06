import React, { useState, useEffect } from 'react';
import { Trees, Plus } from 'lucide-react';
import type { Piquete } from '../types';
import { pastagemService } from '../services/pastagemService';
import { useFarm } from '../contexts/FarmContext';

export const Pastagens: React.FC = () => {
  const { selectedFarm, propriedades, selectFarmById } = useFarm();
  const [piquetes, setPiquetes] = useState<Piquete[]>([]);
  const [propriedadeId, setPropriedadeId] = useState<string>('');
  const [modalAberta, setModalAberta] = useState(false);
  const [form, setForm] = useState({
    nomePiquete: '',
    areaHectares: 10,
    capacidadeCabecas: 20,
    tipoCapim: 'Brachiaria Brizantha',
    observacao: ''
  });

  const carregarPiquetes = async (pId: string) => {
    if (!pId) {
      setPiquetes([]);
      return;
    }
    try {
      const list = await pastagemService.listarPorPropriedade(pId);
      setPiquetes(list || []);
    } catch (err) {
      console.error(err);
      setPiquetes([]);
    }
  };

  useEffect(() => {
    const activeId = selectedFarm?.id || (propriedades.length > 0 ? propriedades[0].id : '');
    if (activeId) {
      setPropriedadeId(activeId);
      carregarPiquetes(activeId);
    } else {
      setPiquetes([]);
    }
  }, [selectedFarm, propriedades]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeId = selectedFarm?.id || propriedadeId;
    if (!activeId) {
      alert('Selecione uma fazenda para cadastrar o piquete.');
      return;
    }
    try {
      await pastagemService.cadastrar(activeId, form);
      setModalAberta(false);
      setForm({
        nomePiquete: '',
        areaHectares: 10,
        capacidadeCabecas: 20,
        tipoCapim: 'Brachiaria Brizantha',
        observacao: ''
      });
      carregarPiquetes(activeId);
      alert('Piquete cadastrado com sucesso!');
    } catch (err) {
      alert('Erro ao cadastrar piquete.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-card border border-agro-border">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trees className="w-7 h-7 text-agro-primary" />
            Gestão de Pastagens e Piquetes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle de lotação de animais por piquete, capacidade de suporte e manejo de pasto
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFarm?.id || propriedadeId}
            onChange={e => {
              setPropriedadeId(e.target.value);
              selectFarmById(e.target.value);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer"
          >
            {propriedades.length === 0 ? (
              <option value="">Nenhuma fazenda cadastrada</option>
            ) : (
              propriedades.map(p => (
                <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
              ))
            )}
          </select>

          <button
            onClick={() => setModalAberta(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Piquete</span>
          </button>
        </div>
      </div>

      {/* PIQUETES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {piquetes.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-agro-border text-slate-400 italic">
            {propriedades.length === 0
              ? 'Cadastre uma fazenda para gerenciar piquetes.'
              : 'Nenhum piquete cadastrado nesta propriedade. Clique em "Novo Piquete" para cadastrar.'}
          </div>
        ) : (
          piquetes.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-5 shadow-card border border-agro-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-slate-800">{p.nomePiquete}</span>
                <span className="px-2.5 py-1 bg-agro-secondary/60 text-agro-forest text-xs font-bold rounded-lg">
                  {p.tipoCapim || 'Capim Piatã'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Área do Piquete</span>
                  <span className="font-bold text-slate-700 text-sm">{p.areaHectares} ha</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Capacidade Suportada</span>
                  <span className="font-bold text-slate-700 text-sm">{p.capacidadeCabecas} cabeças</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                <span>Taxa Recomendada: {(p.capacidadeCabecas / (p.areaHectares || 1)).toFixed(1)} UA/ha</span>
                <span className="text-emerald-700 font-semibold">Pasto em Rotação</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {modalAberta && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Cadastrar Novo Piquete / Pasto</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fazenda / Propriedade</label>
                <select
                  value={propriedadeId}
                  onChange={e => setPropriedadeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50"
                >
                  <option value="">-- Selecione a Fazenda --</option>
                  {propriedades.map(p => (
                    <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Piquete</label>
                <input
                  type="text"
                  required
                  value={form.nomePiquete}
                  onChange={e => setForm({...form, nomePiquete: e.target.value})}
                  placeholder="Ex: Piquete 01 - Baixada"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Área (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.areaHectares}
                    onChange={e => setForm({...form, areaHectares: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capacidade (Cabeças)</label>
                  <input
                    type="number"
                    required
                    value={form.capacidadeCabecas}
                    onChange={e => setForm({...form, capacidadeCabecas: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Variedade do Capim</label>
                <input
                  type="text"
                  value={form.tipoCapim}
                  onChange={e => setForm({...form, tipoCapim: e.target.value})}
                  placeholder="Ex: Mombaça, Marandu, Zuri"
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
                  Salvar Piquete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
