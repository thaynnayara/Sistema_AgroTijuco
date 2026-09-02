import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Scale, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  HeartPulse,
  Syringe,
  Trees,
  Apple,
  Boxes,
  DollarSign,
  Percent
} from 'lucide-react';
import { financeiroService } from '../services/financeiroService';
import { sanitarioService } from '../services/sanitarioService';
import { estoqueService } from '../services/estoqueService';
import { propriedadeService } from '../services/propriedadeService';

export const Dashboard: React.FC = () => {
  const { user, isGestor } = useAuth();
  const userName = user?.nome || (isGestor ? 'Thaynná Yara' : 'Dejean');

  const [desfrute, setDesfrute] = useState<number>(18.5);
  const [carenciasCount, setCarenciasCount] = useState<number>(0);
  const [estoqueCriticoCount, setEstoqueCriticoCount] = useState<number>(0);

  useEffect(() => {
    carregarResumos();
  }, []);

  const carregarResumos = async () => {
    try {
      const props = await propriedadeService.listarTodas();
      if (props.length > 0 && props[0].id) {
        const [apuracao, carencias, alertasEstoque] = await Promise.all([
          financeiroService.apurarCustos(props[0].id, 350, 12000),
          sanitarioService.listarCarenciasAtivas(),
          estoqueService.listarAlertas(props[0].id)
        ]);
        if (apuracao) setDesfrute(apuracao.taxaDesfrutePercentual || 18.5);
        setCarenciasCount(carencias.length);
        setEstoqueCriticoCount(alertasEstoque.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stats = [
    {
      title: 'Taxa de Desfrute (RN03)',
      value: `${desfrute}%`,
      change: 'Comercializados / Total Rebanho',
      icon: Percent,
      color: 'bg-emerald-100 text-agro-forest border-emerald-300',
      path: '/financeiro',
    },
    {
      title: 'Carência Sanitária (RN02)',
      value: `${carenciasCount} Bloqueados`,
      change: 'Animais em isolamento pós-vacina',
      icon: Syringe,
      color: carenciasCount > 0 ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
      path: '/sanidade',
    },
    {
      title: 'Estoque de Insumos (RF08)',
      value: `${estoqueCriticoCount} Críticos`,
      change: 'Rações / Medicamentos no nível mínimo',
      icon: Boxes,
      color: estoqueCriticoCount > 0 ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-teal-50 text-teal-800 border-teal-200',
      path: '/estoque',
    },
    {
      title: 'Ganho Médio Diário (RN01)',
      value: '1.18 kg/dia',
      change: '(Peso Atual - Anterior) / Dias',
      icon: Scale,
      color: 'bg-agro-secondary/60 text-agro-forest border-agro-secondary',
      path: '/pesagens',
    },
  ];

  const modulosSistema = [
    { name: 'Gestão Reprodutiva', desc: 'IATF, Inseminações, Toques e Partos', icon: HeartPulse, path: '/reproducao', color: 'bg-rose-50 text-rose-800' },
    { name: 'Calendário Sanitário', desc: 'Vacinas, Vermífugos e Carência', icon: Syringe, path: '/sanidade', color: 'bg-red-50 text-red-800' },
    { name: 'Manejo de Pastagens', desc: 'Lotação de Piquetes e Rotação', icon: Trees, path: '/pastagens', color: 'bg-emerald-50 text-emerald-800' },
    { name: 'Controle Nutricional', desc: 'Formulação de Dietas e Trato', icon: Apple, path: '/nutricao', color: 'bg-amber-50 text-amber-900' },
    { name: 'Gestão de Estoque', desc: 'Entrada/Saída e Alerta Mínimo', icon: Boxes, path: '/estoque', color: 'bg-teal-50 text-teal-800' },
    { name: 'Financeiro & Custos', desc: 'Custos por @/Litro e Desfrute', icon: DollarSign, path: '/financeiro', color: 'bg-indigo-50 text-indigo-800' },
  ];

  return (
    <div className="space-y-6">
      {/* BANNER DE BOAS-VINDAS */}
      <div className="bg-gradient-to-r from-agro-primary to-agro-forest rounded-2xl p-6 sm:p-7 text-white shadow-agro relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-agro-secondary mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-agro-secondary" />
            <span>{isGestor ? 'Gestão Geral B2B SaaS' : 'Portal do Produtor Rural'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {userName}!
          </h1>
          <p className="mt-2 text-white/90 text-sm sm:text-base leading-relaxed font-normal">
            Plataforma completa de Gestão Pecuária Inteligente. Acompanhe os módulos de Manejo Zootécnico, Operações de Campo, Calendário Sanitário, Estoque e Financeiro.
          </p>
        </div>
      </div>

      {/* CARDS DE INDICADORES PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.path}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-agro transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${stat.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 flex items-center text-xs font-medium text-slate-600">
                  <TrendingUp className="w-3.5 h-3.5 text-agro-primary mr-1" />
                  {stat.change}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* MÓDULOS E REQUISITOS DO SISTEMA */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3.5">
          Módulos Zootécnicos, Operacionais e Financeiros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulosSistema.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link
                key={i}
                to={m.path}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:border-agro-primary transition-all flex items-start space-x-3.5 group"
              >
                <div className={`p-3 rounded-xl ${m.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-agro-primary transition-colors">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.desc}</p>
                  <span className="mt-2 inline-flex items-center text-xs font-semibold text-agro-primary">
                    Acessar Módulo <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
