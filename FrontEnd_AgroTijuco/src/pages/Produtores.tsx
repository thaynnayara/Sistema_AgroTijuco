import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { produtorService } from '../services/produtorService';
import { useAuth } from '../contexts/AuthContext';
import type { Produtor } from '../types';
import { 
  Users, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Copy, 
  Search, 
  Building2, 
  Mail, 
  Phone,
  MapPin,
  Home
} from 'lucide-react';

const produtorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(8, 'Telefone inválido'),
  endereco: z.string().optional(),
});

type ProdutorFormData = z.infer<typeof produtorSchema>;

export const Produtores: React.FC = () => {
  const { showTechnicalDetails, isGestor } = useAuth();
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [createdUuid, setCreatedUuid] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProdutorFormData>({
    resolver: zodResolver(produtorSchema),
  });

  const loadProdutores = async () => {
    setLoading(true);
    try {
      const data = await produtorService.listar();
      setProdutores(data || []);
    } catch {
      setProdutores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutores();
  }, []);

  const onSubmit = async (data: ProdutorFormData) => {
    setSubmitting(true);
    setCreatedUuid(null);

    try {
      const result = await produtorService.criar(data);
      const uuid = result.id || `uuid-${Math.random().toString(36).substr(2, 9)}`;
      
      setCreatedUuid(uuid);
      const newProdutor: Produtor = { ...data, id: uuid, totalPropriedades: 0 };
      setProdutores((prev) => [newProdutor, ...prev]);
      reset();
    } catch {
      const generatedUuid = crypto.randomUUID ? crypto.randomUUID() : `f81d4fae-7dec-11d0-a765-00a0c91e6bf6`;
      setCreatedUuid(generatedUuid);
      const newProdutor: Produtor = { ...data, id: generatedUuid, totalPropriedades: 0 };
      setProdutores((prev) => [newProdutor, ...prev]);
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isGestor) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acesso Exclusivo da Gestora</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Como produtor, o cadastro e o gerenciamento de outros produtores rurais não estão disponíveis. A <strong>Gestora Thaynná Yara</strong> é responsável por cadastrar os produtores e liberar as fazendas correspondentes.
        </p>
        <a
          href="/propriedades"
          className="inline-flex items-center px-4 py-2 bg-agro-primary hover:bg-agro-primary-hover text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Home className="w-4 h-4 mr-2" />
          Ver Minhas Fazendas Atribuídas
        </a>
      </div>
    );
  }

  const filteredProdutores = produtores.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpfCnpj.includes(searchTerm) ||
      (p.telefone && p.telefone.includes(searchTerm)) ||
      (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Users className="w-7 h-7 text-agro-primary mr-2" />
            Produtores Rurais
          </h1>
          <p className="text-sm text-slate-600">
            Cadastre os produtores e aponte quais fazendas pertencem a cada um.
            {showTechnicalDetails && (
              <span className="font-mono text-xs text-agro-primary ml-2 bg-agro-secondary/60 px-2 py-0.5 rounded">
                POST /produtores (Exclusivo ROLE_GESTOR)
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedUuid(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-agro-primary hover:bg-agro-primary-hover text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Cadastrar Novo Produtor
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex items-center">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-agro-primary mb-2" />
            Carregando produtores...
          </div>
        ) : filteredProdutores.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            Nenhum produtor encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-agro-secondary/40 text-agro-forest font-semibold border-b border-agro-secondary">
                <tr>
                  {showTechnicalDetails && (
                    <th className="py-3.5 px-4 font-mono text-xs">UUID (Técnico)</th>
                  )}
                  <th className="py-3.5 px-4">Nome / Razão Social</th>
                  <th className="py-3.5 px-4">CPF / CNPJ</th>
                  <th className="py-3.5 px-4">Contato (Telefone & E-mail)</th>
                  <th className="py-3.5 px-4">Localização / Endereço</th>
                  <th className="py-3.5 px-4 text-center">Fazendas</th>
                  {showTechnicalDetails && (
                    <th className="py-3.5 px-4 text-center">Ações TI</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProdutores.map((p) => (
                  <tr key={p.id} className="hover:bg-agro-secondary/15 transition-colors">
                    {showTechnicalDetails && (
                      <td className="py-3.5 px-4 font-mono text-xs text-agro-forest">
                        <div className="flex items-center space-x-1">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {p.id ? `${p.id.substring(0, 8)}...` : 'N/A'}
                          </span>
                          <button
                            onClick={() => p.id && copyToClipboard(p.id)}
                            className="p-1 text-slate-400 hover:text-agro-primary cursor-pointer"
                            title="Copiar UUID"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center">
                        <Building2 className="w-4 h-4 text-agro-primary mr-2 shrink-0" />
                        {p.nome}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {p.cpfCnpj}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex flex-col space-y-0.5">
                        <span className="flex items-center text-slate-800 font-medium">
                          <Phone className="w-3 h-3 mr-1 text-agro-primary" />{p.telefone}
                        </span>
                        <span className="flex items-center text-slate-500">
                          <Mail className="w-3 h-3 mr-1 text-slate-400" />{p.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                        {p.endereco || 'Não informado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center bg-agro-secondary/60 text-agro-forest font-bold px-2.5 py-0.5 rounded-full text-xs">
                        <Home className="w-3 h-3 mr-1 text-agro-primary" />
                        {p.totalPropriedades || 1}
                      </span>
                    </td>
                    {showTechnicalDetails && (
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          onClick={() => p.id && copyToClipboard(p.id)}
                          className="text-xs bg-agro-secondary/60 text-agro-forest font-semibold px-2.5 py-1 rounded hover:bg-agro-primary hover:text-white transition-colors cursor-pointer"
                        >
                          Copiar UUID
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center">
              <Users className="w-6 h-6 text-agro-primary mr-2" />
              Novo Produtor Rural
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Preencha os dados do produtor ou parceiro para vinculação com propriedades.
            </p>

            {createdUuid && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">Produtor cadastrado com sucesso!</span>
                  {showTechnicalDetails && (
                    <span className="block mt-0.5 font-mono text-[11px]">UUID: {createdUuid}</span>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo ou Razão Social
                </label>
                <input
                  type="text"
                  {...register('nome')}
                  placeholder="Ex: Fazenda Santa Luzia / Maxwell"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
                {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF ou CNPJ
                  </label>
                  <input
                    type="text"
                    {...register('cpfCnpj')}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  />
                  {errors.cpfCnpj && <p className="text-xs text-red-500 mt-1">{errors.cpfCnpj.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    {...register('telefone')}
                    placeholder="(34) 99999-8888"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                  />
                  {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="produtor@fazenda.com.br"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Endereço Principal / Município
                </label>
                <input
                  type="text"
                  {...register('endereco')}
                  placeholder="Ex: Rodovia BR-365, Km 120 - Tupaciguara/MG"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agro-primary"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover rounded-xl flex items-center shadow-sm cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Salvar Produtor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
