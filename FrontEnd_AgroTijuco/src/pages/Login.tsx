import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Sprout, Lock, Mail, Loader2, ArrowRight, UserPlus, Building2, UserCheck, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Digite um e-mail válido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  lembrarMe: z.boolean(),
});

const registerSchema = z.object({
  nome: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres'),
  tenantId: z.string().min(3, 'Informe o nome da sua fazenda ou propriedade'),
  email: z.string().min(1, 'E-mail é obrigatório').email('Digite um e-mail válido'),
  senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  confirmarSenha: z.string().min(8, 'Confirmação de senha obrigatória'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas digitadas não coincidem',
  path: ['confirmarSenha'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form de Login
  const {
    register: registerLoginField,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
      lembrarMe: true,
    },
  });

  // Form de Registro
  const {
    register: registerSignUpField,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      tenantId: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await login(
        {
          email: (data.email || '').trim().toLowerCase(),
          senha: (data.senha || '').trim(),
        },
        data.lembrarMe
      );
      navigate('/dashboard');
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || err.message || '';
      const msg = rawMsg && !rawMsg.includes('URL') && !rawMsg.includes('Failed to construct') && !rawMsg.includes('status code')
        ? rawMsg
        : 'E-mail ou senha incorretos. Por favor, verifique suas credenciais de acesso.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await registerUser(
        {
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          tenantId: data.tenantId,
          role: 'PRODUTOR',
        },
        true
      );
      setSuccessMessage('Conta criada com sucesso! Redirecionando para o painel...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erro ao criar conta. Verifique os dados informados.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-agro-bg flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
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
          Gestão Pecuária Simples, Inteligente e Segura
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-agro sm:rounded-2xl sm:px-10 border border-agro-border relative">
          
          {/* Abas: Entrar vs Criar Conta */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-agro-forest shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-agro-primary" />
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-agro-forest shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-agro-primary" />
              Criar Nova Conta
            </button>
          </div>

          {/* Mensagens de Feedback */}
          {errorMessage && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
              {successMessage}
            </div>
          )}

          {/* FORMULÁRIO DE LOGIN */}
          {activeTab === 'login' && (
            <form className="space-y-4" onSubmit={handleLoginSubmit(onLoginSubmit)}>
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
                    {...registerLoginField('email')}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border ${
                      loginErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:border-agro-primary focus:ring-agro-primary'
                    } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-sm text-slate-900 transition-colors`}
                    placeholder="seu.email@fazenda.com.br"
                  />
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{loginErrors.email.message}</p>
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
                    {...registerLoginField('senha')}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border ${
                      loginErrors.senha ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:border-agro-primary focus:ring-agro-primary'
                    } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-sm text-slate-900 transition-colors`}
                    placeholder="••••••••"
                  />
                </div>
                {loginErrors.senha && (
                  <p className="mt-1 text-xs text-red-500">{loginErrors.senha.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="lembrarMe"
                    type="checkbox"
                    {...registerLoginField('lembrarMe')}
                    className="h-4 w-4 text-agro-primary focus:ring-agro-primary border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="lembrarMe" className="ml-2 block text-xs text-slate-700 cursor-pointer">
                    Manter conectado
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-primary shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Entrar na Plataforma
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORMULÁRIO DE CRIAR CONTA */}
          {activeTab === 'register' && (
            <form className="space-y-4" onSubmit={handleSignUpSubmit(onRegisterSubmit)}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  {...registerSignUpField('nome')}
                  className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-agro-primary focus:ring-agro-primary rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-sm text-slate-900 transition-colors"
                  placeholder="Ex: João da Silva / Maria Oliveira"
                />
                {registerErrors.nome && (
                  <p className="mt-1 text-xs text-red-500">{registerErrors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nome da Fazenda / Propriedade
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-5 w-5 text-agro-primary/70" />
                  </div>
                  <input
                    type="text"
                    {...registerSignUpField('tenantId')}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-agro-primary focus:ring-agro-primary rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-sm text-slate-900 transition-colors"
                    placeholder="Ex: Fazenda Santa Luzia"
                  />
                </div>
                {registerErrors.tenantId && (
                  <p className="mt-1 text-xs text-red-500">{registerErrors.tenantId.message}</p>
                )}
              </div>

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
                    {...registerSignUpField('email')}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-agro-primary focus:ring-agro-primary rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-sm text-slate-900 transition-colors"
                    placeholder="contato@fazenda.com.br"
                  />
                </div>
                {registerErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{registerErrors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Senha (mín. 8 dígitos)
                  </label>
                  <input
                    type="password"
                    {...registerSignUpField('senha')}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-agro-primary focus:ring-agro-primary rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-sm text-slate-900 transition-colors"
                    placeholder="••••••••"
                  />
                  {registerErrors.senha && (
                    <p className="mt-1 text-xs text-red-500">{registerErrors.senha.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    {...registerSignUpField('confirmarSenha')}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-agro-primary focus:ring-agro-primary rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-sm text-slate-900 transition-colors"
                    placeholder="••••••••"
                  />
                  {registerErrors.confirmarSenha && (
                    <p className="mt-1 text-xs text-red-500">{registerErrors.confirmarSenha.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-agro-primary hover:bg-agro-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-primary shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Criando sua conta...
                  </>
                ) : (
                  <>
                    Criar Conta e Acessar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500 gap-1.5">
            <ShieldCheck className="w-4 h-4 text-agro-primary" />
            <span>Plataforma Segura e Confiável</span>
          </div>
        </div>
      </div>
    </div>
  );
};


