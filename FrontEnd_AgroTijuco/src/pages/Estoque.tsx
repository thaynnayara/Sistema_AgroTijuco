import React, { useState, useEffect } from 'react';
import { Boxes, Plus, ShieldAlert } from 'lucide-react';
import type { ItemEstoque, Propriedade } from '../types';
import { estoqueService } from '../services/estoqueService';
import { propriedadeService } from '../services/propriedadeService';

export const Estoque: React.FC = () => {
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [propriedadeId, setPropriedadeId] = useState<string>('');
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalMovimento, setModalMovimento] = useState<{ aberta: boolean; item?: ItemEstoque; entrada: boolean }>({ aberta: false, entrada: true });
  const [qtdMovimento, setQtdMovimento] = useState<number>(10);

  const [form, setForm] = useState({
    nomeItem: 'Ração Confinamento 18%',
    categoria: 'RACAO' as ItemEstoque['categoria'],
    quantidadeAtual: 1500,
    quantidadeMinima: 500,
    unidadeMedida: 'KG' as ItemEstoque['unidadeMedida']
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
        carregarEstoque(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const carregarEstoque = async (pId: string) => {
    try {
      const list = await estoqueService.listarPorPropriedade(pId);
      setItens(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propriedadeId) return alert('Selecione uma fazenda.');
    try {
      await estoqueService.cadastrar(propriedadeId, form);
      setModalCadastro(false);
      carregarEstoque(propriedadeId);
    } catch (err) {
      alert('Erro ao cadastrar item de estoque.');
    }
  };

  const handleMovimentoSubmit = async () => {
    if (!modalMovimento.item?.id) return;
    try {
      await estoqueService.movimentar(modalMovimento.item.id, qtdMovimento, modalMovimento.entrada);
      setModalMovimento({ aberta: false, entrada: true });
      carregarEstoque(propriedadeId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro na movimentação de estoque.');
    }
  };

  const itensCriticos = itens.filter(i => i.quantidadeAtual <= i.quantidadeMinima);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-card border border-agro-border">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Boxes className="w-7 h-7 text-agro-primary" />
            Gestão de Estoque & Alertas (RF08)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle de entrada e saída de insumos (rações, medicamentos, sal mineral) e alertas de estoque crítico
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={propriedadeId}
            onChange={e => {
              setPropriedadeId(e.target.value);
              carregarEstoque(e.target.value);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
          >
            {propriedades.map(p => (
              <option key={p.id} value={p.id}>{p.nomeFazenda || p.nome}</option>
            ))}
          </select>

          <button
            onClick={() => setModalCadastro(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Insumo</span>
          </button>
        </div>
      </div>

      {/* ALERTAS CRÍTICOS */}
      {itensCriticos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-900">
              Alerta de Estoque Mínimo Atingido ({itensCriticos.length} Insumos em Nível Crítico)
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {itensCriticos.map(i => (
                <span key={i.id} className="px-2.5 py-1 bg-amber-200 text-amber-900 text-xs font-bold rounded-lg">
                  ⚠️ {i.nomeItem}: {i.quantidadeAtual} {i.unidadeMedida} (Mínimo: {i.quantidadeMinima})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ESTOQUE TABLE */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-agro-border space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Insumo / Item</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Qtd Atual</th>
                <th className="px-4 py-3">Qtd Mínima</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações Movimentação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400 italic">
                    Nenhum insumo em estoque cadastrado nesta propriedade.
                  </td>
                </tr>
              ) : (
                itens.map(item => {
                  const critico = item.quantidadeAtual <= item.quantidadeMinima;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{item.nomeItem}</td>
                      <td className="px-4 py-3 font-semibold text-xs text-slate-500">{item.categoria}</td>
                      <td className="px-4 py-3 font-bold text-base text-slate-800">
                        {item.quantidadeAtual} {item.unidadeMedida}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{item.quantidadeMinima} {item.unidadeMedida}</td>
                      <td className="px-4 py-3">
                        {critico ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-lg">
                            ⚠️ Crítico
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
                            ✓ Normal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setModalMovimento({ aberta: true, item, entrada: true })}
                          className="px-2.5 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          + Entrada
                        </button>
                        <button
                          onClick={() => setModalMovimento({ aberta: true, item, entrada: false })}
                          className="px-2.5 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          - Saída
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CADASTRO */}
      {modalCadastro && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Cadastrar Insumo / Item no Estoque</h3>
            <form onSubmit={handleCadastro} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Item</label>
                <input
                  type="text"
                  required
                  value={form.nomeItem}
                  onChange={e => setForm({...form, nomeItem: e.target.value})}
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
                    <option value="RACAO">Ração</option>
                    <option value="MEDICAMENTO">Medicamento</option>
                    <option value="SUPLEMENTO">Suplemento Mineral</option>
                    <option value="FERRAMENTA">Peças / Ferramentas</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidade de Medida</label>
                  <select
                    value={form.unidadeMedida}
                    onChange={e => setForm({...form, unidadeMedida: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="KG">Quilos (KG)</option>
                    <option value="LITRO">Litros</option>
                    <option value="UNIDADE">Unidades</option>
                    <option value="DOSE">Doses</option>
                    <option value="SACO">Sacos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qtd Inicial</label>
                  <input
                    type="number"
                    required
                    value={form.quantidadeAtual}
                    onChange={e => setForm({...form, quantidadeAtual: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qtd Mínima (Alerta)</label>
                  <input
                    type="number"
                    required
                    value={form.quantidadeMinima}
                    onChange={e => setForm({...form, quantidadeMinima: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCadastro(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agro-primary text-white font-semibold text-sm rounded-xl hover:bg-agro-primary-hover shadow-xs"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MOVIMENTAÇÃO */}
      {modalMovimento.aberta && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {modalMovimento.entrada ? '📥 Registrar Entrada' : '📤 Registrar Saída'} — {modalMovimento.item?.nomeItem}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade ({modalMovimento.item?.unidadeMedida})</label>
              <input
                type="number"
                min="1"
                value={qtdMovimento}
                onChange={e => setQtdMovimento(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-base font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMovimento({ aberta: false, entrada: true })}
                className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleMovimentoSubmit}
                className={`px-4 py-2 text-white font-semibold text-sm rounded-xl shadow-xs ${
                  modalMovimento.entrada ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar {modalMovimento.entrada ? 'Entrada' : 'Saída'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
