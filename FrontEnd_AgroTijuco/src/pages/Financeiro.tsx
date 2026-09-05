import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Calculator } from 'lucide-react';
import type { DespesaOperacional, Propriedade, ResumoApuracaoCustos } from '../types';
import { financeiroService } from '../services/financeiroService';
import { propriedadeService } from '../services/propriedadeService';

export const Financeiro: React.FC = () => {
  const [despesas, setDespesas] = useState<DespesaOperacional[]>([]);
  const [resumo, setResumo] = useState<ResumoApuracaoCustos | null>(null);
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [propriedadeId, setPropriedadeId] = useState<string>('');
  
  const [arrobasProduzidas, setArrobasProduzidas] = useState<number>(350);
  const [litrosLeiteProduzidos, setLitrosLeiteProduzidos] = useState<number>(12000);
  const [modalAberta, setModalAberta] = useState(false);

  const [form, setForm] = useState({
    descricao: '',
    categoria: 'RACAO' as DespesaOperacional['categoria'],
    valor: 0,
    dataDespesa: new Date().toISOString().split('T')[0],
    tipoProducao: 'CORTE_ARROBA' as DespesaOperacional['tipoProducao'],
    totalProduzidoPeriodo: 350
  });

  useEffect(() => {
    carregarPropriedades();
  }, []);

  const carregarPropriedades = async () => {
    try {
      const list = await propriedadeService.listarTodas();
      setPropriedades(list || []);
      if (list && list.length > 0 && list[0].id) {
        setPropriedadeId(list[0].id);
        carregarFinanceiro(list[0].id, arrobasProduzidas, litrosLeiteProduzidos);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const carregarFinanceiro = async (pId: string, arrobas: number, litros: number) => {
    if (!pId) return;
    try {
      const [listDespesas, apuracao] = await Promise.all([
        financeiroService.listarDespesas(pId),
        financeiroService.apurarCustos(pId, arrobas, litros)
      ]);
      setDespesas(listDespesas || []);
      setResumo(apuracao);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecalcular = () => {
    if (propriedadeId) {
      carregarFinanceiro(propriedadeId, arrobasProduzidas, litrosLeiteProduzidos);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propriedadeId) {
      alert('Selecione uma fazenda para lançar a despesa.');
      return;
    }
    try {
      await financeiroService.registrarDespesa(propriedadeId, form);
      setModalAberta(false);
      setForm({
        descricao: '',
        categoria: 'RACAO',
        valor: 0,
        dataDespesa: new Date().toISOString().split('T')[0],
        tipoProducao: 'CORTE_ARROBA',
        totalProduzidoPeriodo: 350
      });
      carregarFinanceiro(propriedadeId, arrobasProduzidas, litrosLeiteProduzidos);
      alert('Despesa registrada com sucesso!');
    } catch (err) {
      alert('Erro ao registrar despesa.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-card border border-agro-border">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-agro-primary" />
            Módulo Financeiro, Custos & Taxa de Desfrute
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rateio de despesas operacionais por arroba (@) ou litro de leite e taxa de desfrute do rebanho
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={propriedadeId}
            onChange={e => {
              setPropriedadeId(e.target.value);
              carregarFinanceiro(e.target.value, arrobasProduzidas, litrosLeiteProduzidos);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
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
            <span>Lançar Despesa</span>
          </button>
        </div>
      </div>

      {/* CARDS DE KPIS FINANCEIROS E TAXA DE DESFRUTE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Despesas */}
        <div className="bg-white p-5 rounded-2xl shadow-card border border-agro-border space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Despesas Operacionais</span>
          <span className="text-2xl font-black text-slate-800 block">
            R$ {resumo?.totalDespesas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </span>
          <span className="text-[11px] text-slate-500 block">Insumos, Mão de Obra e Manutenção</span>
        </div>

        {/* Custo por Arroba */}
        <div className="bg-white p-5 rounded-2xl shadow-card border border-agro-border space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Custo por Arroba (@)</span>
          <span className="text-2xl font-black text-agro-forest block">
            R$ {resumo?.custoPorArroba?.toFixed(2) || '0,00'} /@
          </span>
          <span className="text-[11px] text-slate-500 block">Baseado em {arrobasProduzidas} @ produzidas</span>
        </div>

        {/* Custo por Litro de Leite */}
        <div className="bg-white p-5 rounded-2xl shadow-card border border-agro-border space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Custo por Litro de Leite</span>
          <span className="text-2xl font-black text-agro-primary block">
            R$ {resumo?.custoPorLitroLeite?.toFixed(2) || '0,00'} /L
          </span>
          <span className="text-[11px] text-slate-500 block">Baseado em {litrosLeiteProduzidos.toLocaleString()} L produzidos</span>
        </div>

        {/* Taxa de Desfrute */}
        <div className="bg-gradient-to-br from-agro-primary to-agro-dark text-white p-5 rounded-2xl shadow-card space-y-1">
          <span className="text-xs font-bold text-agro-secondary uppercase tracking-wider block">Taxa de Desfrute</span>
          <span className="text-3xl font-black block text-amber-300">
            {resumo?.taxaDesfrutePercentual || 0}%
          </span>
          <span className="text-[11px] text-white/80 block">
            {resumo?.comercializadosNoAno || 0} de {resumo?.totalRebanho || 0} animais comercializados/abatidos
          </span>
        </div>
      </div>

      {/* SIMULADOR DE RATEIO */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-agro-border space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-agro-primary" />
              Simulador de Volume Produzido para Rateio de Custos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Altere a produção total estimada do período para calcular o custo exato por unidade</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Total @ Produzidas</label>
              <input
                type="number"
                value={arrobasProduzidas}
                onChange={e => setArrobasProduzidas(Number(e.target.value))}
                className="w-28 px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Total Litros Leite</label>
              <input
                type="number"
                value={litrosLeiteProduzidos}
                onChange={e => setLitrosLeiteProduzidos(Number(e.target.value))}
                className="w-32 px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-bold"
              />
            </div>
            <button
              onClick={handleRecalcular}
              className="mt-4 px-4 py-2 bg-agro-secondary text-agro-forest font-bold text-xs rounded-xl hover:bg-agro-secondary/80 cursor-pointer"
            >
              Recalcular
            </button>
          </div>
        </div>

        {/* TABELA DE DESPESAS */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Descrição da Despesa</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Tipo Produção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {despesas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                    Nenhuma despesa registrada nesta fazenda.
                  </td>
                </tr>
              ) : (
                despesas.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{d.descricao}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                        {d.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      R$ {d.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">{d.dataDespesa}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{d.tipoProducao || 'Geral'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DESPESA */}
      {modalAberta && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Lançar Nova Despesa Operacional</h3>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compra de sal mineral, conserto de cerca, etc."
                  value={form.descricao}
                  onChange={e => setForm({...form, descricao: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={e => setForm({...form, categoria: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="RACAO">Ração / Nutrição</option>
                    <option value="MEDICAMENTOS">Medicamentos / Vacinas</option>
                    <option value="MAO_DE_OBRA">Mão de Obra</option>
                    <option value="MANUTENCAO">Manutenção / Peças</option>
                    <option value="COMBUSTIVEL">Combustível</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.valor}
                    onChange={e => setForm({...form, valor: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data da Despesa</label>
                  <input
                    type="date"
                    required
                    value={form.dataDespesa}
                    onChange={e => setForm({...form, dataDespesa: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Produção</label>
                  <select
                    value={form.tipoProducao}
                    onChange={e => setForm({...form, tipoProducao: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="CORTE_ARROBA">Corte (Arroba @)</option>
                    <option value="LEITE_LITRO">Leite (Litros)</option>
                  </select>
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
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
