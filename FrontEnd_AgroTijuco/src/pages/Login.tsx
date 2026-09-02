import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Sprout, Lock, Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Digite um e-mail válido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  lembrarMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, setMockAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDevOptions, setShowDevOptions] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'thaynna.yara@agrotijuco.com.br',
      senha: 'password123',
      lembrarMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(
        {
          email: data.email,
          senha: data.senha,
        },
        data.lembrarMe
      );
      navigate('/dashboard');
    } catch (err: unknown) {
      console.warn('Backend API login offline or error, offering demo fallback:', err);
      setMockAuth(
        {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          nome: 'Thaynná Yara (Gestora)',
          email: data.email,
          perfil: 'ADMIN',
          tenantId: 'Fazenda AgroTijuco',
        },
        'mock-jwt-token-agrotijuco-b2b-sample'
      );
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessGestor = () => {
    setValue('email', 'thaynna.yara@agrotijuco.com.br');
    setValue('senha', 'agro123456');
    setMockAuth(
      {
        id: 'usr-thaynna-yara-gestora',
        nome: 'Thaynná Yara',
        email: 'thaynna.yara@agrotijuco.com.br',
        perfil: 'GESTOR',
        role: 'GESTOR',
        tenantId: 'Fazenda AgroTijuco',
      },
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token-gestora'
    );
    navigate('/dashboard');
  };

  const handleAccessProdutor = () => {
    setValue('email', 'dejean.barreto@fazenda.com.br');
    setValue('senha', 'agro123456');
    setMockAuth(
      {
        id: 'usr-dejean-barreto-produtor',
        nome: 'Dejean Barreto',
        email: 'dejean.barreto@fazenda.com.br',
        perfil: 'PRODUTOR',
        role: 'PRODUTOR',
        tenantId: 'Fazenda AgroTijuco',
        produtorId: '9b1deb4d-3b7d-4149-9cd6-890000000001',
        produtorNome: 'Dejean Barreto',
      },
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token-produtor'
    );
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-agro-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <div className="bg-agro-primary p-3.5 rounded-2xl shadow-md flex items-center justify-center text-white">
            <Sprout className="w-10 h-10 text-agro-secondary" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-agro-forest tracking-tight">
          AgroTijuco
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Gestão Pecuária Simples, Inteligente e Prática
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-agro sm:rounded-2xl sm:px-10 border border-agro-border relative">
          
          {errorMessage && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5 text-agro-primary/70" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border ${
                    errors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:border-agro-primary focus:ring-agro-primary'
                  } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-sm text-slate-900 transition-colors`}
                  placeholder="thaynna.yara@agrotijuco.com.br"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5 text-agro-primary/70" />
                </div>
                <input
                  type="password"
                  {...register('senha')}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border ${
                    errors.senha ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:border-agro-primary focus:ring-agro-primary'
                  } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-sm text-slate-900 transition-colors`}
                  placeholder="••••••••"
                />
              </div>
              {errors.senha && (
                <p className="mt-1 text-xs text-red-500">{errors.senha.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="lembrarMe"
                  type="checkbox"
                  {...register('lembrarMe')}
                  className="h-4 w-4 text-agro-primary focus:ring-agro-primary border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="lembrarMe" className="ml-2 block text-xs text-slate-700 cursor-pointer">
                  Manter conectado
                </label>
              </div>

              <div className="text-xs">
                <a href="#ajuda" onClick={(e) => { e.preventDefault(); alert('Em caso de dúvidas, utilize o modo demonstração ou contate a gestão.'); }} className="font-medium text-agro-primary hover:underline">
                  Precisa de ajuda?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-primary shadow-sm transition-all duration-200 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Entrando no sistema...
                </>
              ) : (
                <>
                  Entrar com E-mail & Senha
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <div className="text-center text-xs font-semibold text-slate-500 mb-1">
              Ou selecione o perfil de acesso demonstrativo:
            </div>

            <button
              onClick={handleAccessGestor}
              type="button"
              className="w-full py-2.5 px-4 bg-agro-primary hover:bg-agro-primary-hover text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              🌱 Entrar como Gestora Geral (Thaynná Yara)
            </button>

            <button
              onClick={handleAccessProdutor}
              type="button"
              className="w-full py-2.5 px-4 bg-agro-secondary hover:bg-agro-secondary-dark text-agro-forest rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
            >
              🌾 Entrar como Produtor Rural (Dejean Barreto)
            </button>

            <button
              onClick={() => setShowDevOptions(!showDevOptions)}
              type="button"
              className="w-full text-center text-[11px] text-slate-600 hover:text-slate-700 py-1"
            >
              {showDevOptions ? '▲ Ocultar detalhes de rede/API' : '▼ Informações Técnicas da API'}
            </button>

            {showDevOptions && (
              <div className="mt-2 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="flex items-center text-agro-primary font-semibold">
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Regras de Permissão da API (Spring Boot):
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  - GESTOR/ADMIN: Acesso total a POST /produtores e POST /propriedades/produtor/&#123;id&#125;
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  - PRODUTOR: Acesso restrito a suas fazendas, animais e pesagens. Bloqueado em cadastro de produtores/fazendas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
