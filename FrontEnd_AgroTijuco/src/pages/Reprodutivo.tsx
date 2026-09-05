import React, { useState, useEffect } from 'react';
import { HeartPulse, Plus, Sparkles, Filter } from 'lucide-react';
import type { EventoReprodutivo, Animal } from '../types';
import { reprodutivoService } from '../services/reprodutivoService';
import { animalService } from '../services/animalService';

export const Reprodutivo: React.FC = () => {
  const [alertas, setAlertas] = useState<EventoReprodutivo[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [animalSelecionado, setAnimalSelecionado] = useState<string>('');
  const [eventosAnimal, setEventosAnimal] = useState<EventoReprodutivo[]>([]);
  const [modalAberta, setModalAberta] = useState(false);

  const [form, setForm] = useState({
    animalId: '',
    tipo: 'IATF' as EventoReprodutivo['tipo'],
    dataEvento: new Date().toISOString().split('T')[0],
    observacao: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [listAnimais, listAlertas] = await Promise.all([
        animalService.listarTodos(),
        reprodutivoService.listarAlertas()
      ]);
      const femeas = listAnimais.filter(a => a.sexo === 'F' || a.sexo === 'FEMEA');
      setAnimais(femeas);
      setAlertas(listAlertas);
      if (femeas.length > 0 && femeas[0].id) {
        setAnimalSelecionado(femeas[0].id);
        carregarEventosAnimal(femeas[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const carregarEventosAnimal = async (id: string) => {
    try {
      const data = await reprodutivoService.listarPorAnimal(id);
      setEventosAnimal(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.animalId) return alert('Selecione uma matriz/vaca.');
    try {
      await reprodutivoService.registrar(form.animalId, {
        tipo: form.tipo,
        dataEvento: form.dataEvento,
        observacao: form.observacao
      });
      setModalAberta(false);
      carregarDados();
    } catch (err) {
      alert('Erro ao registrar evento reprodutivo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-card border border-agro-border">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-agro-primary" />
            Gestão Reprodutiva
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle de IATF, Inseminações, Toques, Partos e Alertas de Previsão de Ciclos
          </p>
        </div>

        <button
          onClick={() => setModalAberta(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Lançar Evento Reprodutivo</span>
        </button>
      </div>

      {/* ALERTAS DE PREVISÃO */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-amber-900 mb-3 text-base">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>Alertas de Previsão das Próximas Etapas (Próximos 45 dias)</span>
        </div>

        {alertas.length === 0 ? (
          <p className="text-xs text-amber-800 italic">Nenhum evento reprodutivo com parto ou toque previsto para os próximos dias.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertas.map((a, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Vaca: Brinco #{a.brincoAnimal || 'Matriz'}</span>
                  <span className="text-[11px] text-amber-800 font-semibold block mt-0.5">Evento: {a.tipo}</span>
                  <span className="text-[11px] text-slate-500 block">Previsão Próxima Etapa: {a.dataPrevisaoProximaEtapa}</span>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg">
                  {a.tipo === 'INSEMINACAO' || a.tipo === 'IATF' ? 'Previsão Parto' : 'Acompanhamento'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETALHES POR ANIMAL */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-agro-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-agro-primary" />
            Histórico Reprodutivo da Matriz
          </h2>

          <select
            value={animalSelecionado}
            onChange={(e) => {
              setAnimalSelecionado(e.target.value);
              carregarEventosAnimal(e.target.value);
            }}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
          >
            {animais.map(a => (
              <option key={a.id} value={a.id}>Brinco #{a.brinco} ({a.raca || 'Matriz'})</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tipo do Evento</th>
                <th className="px-4 py-3">Data Realizada</th>
                <th className="px-4 py-3">Previsão Próxima Etapa</th>
                <th className="px-4 py-3">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventosAnimal.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">Nenhum evento reprodutivo lançado para esta matriz.</td>
                </tr>
              ) : (
                eventosAnimal.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <span className="px-2.5 py-1 bg-agro-secondary/60 text-agro-forest font-bold text-xs rounded-lg">
                        {e.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">{e.dataEvento}</td>
                    <td className="px-4 py-3 font-semibold text-amber-700">{e.dataPrevisaoProximaEtapa || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-500">{e.observacao || '—'}</td>
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
            <h3 className="text-lg font-bold text-slate-800">Registrar Evento Reprodutivo</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selecione a Matriz/Vaca</label>
                <select
                  required
                  value={form.animalId}
                  onChange={e => setForm({...form, animalId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">Selecione...</option>
                  {animais.map(a => (
                    <option key={a.id} value={a.id}>Brinco #{a.brinco} ({a.raca})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Evento</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm({...form, tipo: e.target.value as any})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="IATF">IATF (Inseminação Artificial em Tempo Fixo)</option>
                  <option value="INSEMINACAO">Inseminação Convencional</option>
                  <option value="TOQUE">Diagnóstico de Gestação (Toque/USG)</option>
                  <option value="PARTO">Parto / Nascimento</option>
                  <option value="SECAGEM">Secagem de Vaca</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data do Evento</label>
                <input
                  type="date"
                  required
                  value={form.dataEvento}
                  onChange={e => setForm({...form, dataEvento: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observação</label>
                <textarea
                  rows={2}
                  value={form.observacao}
                  onChange={e => setForm({...form, observacao: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  placeholder="Touro/Sêmen utilizado, escore corporal..."
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
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
