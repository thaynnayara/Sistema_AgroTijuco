import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sprout, 
  LayoutDashboard, 
  Users, 
  Home, 
  Beef, 
  Scale, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  HeartPulse,
  Syringe,
  Trees,
  Apple,
  Boxes,
  DollarSign,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { offlineSyncService } from '../services/offlineSyncService';
import api from '../services/api';

export const DashboardLayout: React.FC = () => {
  const { 
    user, 
    logout, 
    isGestor, 
    switchUserRole
  } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updateCount = () => {
      setOfflineCount(offlineSyncService.obterFila().length);
    };

    updateCount();
    const interval = setInterval(updateCount, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine || syncing) return;
    setSyncing(true);
    try {
      const res = await offlineSyncService.sincronizar(api);
      if (res.processados > 0) {
        alert(`Sincronização concluída! ${res.processados} registros enviados ao servidor.`);
      }
    } catch (err) {
      console.error('Erro na sincronização offline:', err);
    } finally {
      setSyncing(false);
      setOfflineCount(offlineSyncService.obterFila().length);
    }
  };

  const navItems = [
    { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
    ...(isGestor ? [{ name: 'Produtores Rurais', path: '/produtores', icon: Users }] : []),
    { name: 'Fazendas & Propriedades', path: '/propriedades', icon: Home },
    { name: 'Rebanho & Animais', path: '/animais', icon: Beef },
    { name: 'Controle de Pesagens', path: '/pesagens', icon: Scale },
    { name: 'Gestão Reprodutiva', path: '/reproducao', icon: HeartPulse },
    { name: 'Calendário Sanitário', path: '/sanidade', icon: Syringe },
    { name: 'Manejo de Pastagens', path: '/pastagens', icon: Trees },
    { name: 'Controle Nutricional', path: '/nutricao', icon: Apple },
    { name: 'Gestão de Estoque', path: '/estoque', icon: Boxes },
    { name: 'Financeiro & Custos', path: '/financeiro', icon: DollarSign },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.nome || (isGestor ? 'Thaynná Yara' : 'João da Silva Sauro');

  return (
    <div className="min-h-screen bg-agro-bg flex flex-col font-sans">
      {/* HEADER NAVBAR */}
      <header className="bg-agro-primary text-white sticky top-0 z-30 shadow-md border-b border-agro-primary-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-agro-secondary hover:bg-white/10 focus:outline-none cursor-pointer"
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="bg-white/15 p-2 rounded-xl backdrop-blur-xs border border-white/20 shadow-xs">
                <Sprout className="w-6 h-6 text-agro-secondary" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-tight">AgroTijuco</span>
                <span className="text-[11px] font-medium text-agro-secondary block leading-none">
                  {isGestor ? 'Gestão da Fazenda' : 'Portal do Produtor'}
                </span>
              </div>
            </div>
          </div>

          {/* Offline Sync Status & Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* RNF01 / RNF02 Indicator */}
            <div className="flex items-center space-x-2 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              {isOnline ? (
                <div className="flex items-center space-x-1.5 text-emerald-300 font-medium">
                  <Wifi className="w-4 h-4" />
                  <span className="hidden sm:inline">Online</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-amber-300 font-medium animate-pulse">
                  <WifiOff className="w-4 h-4" />
                  <span>Offline</span>
                </div>
              )}

              {offlineCount > 0 && (
                <button
                  onClick={handleSync}
                  disabled={syncing || !isOnline}
                  className="flex items-center space-x-1 bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md font-bold text-[11px] hover:bg-amber-300 disabled:opacity-50 cursor-pointer"
                  title="Sincronizar dados gravados localmente"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{offlineCount} Pendentes</span>
                </button>
              )}
            </div>

            {/* Alternar Perfil */}
            <button
              onClick={() => switchUserRole(isGestor ? 'PRODUTOR' : 'GESTOR')}
              title={isGestor ? "Alternar para simular a visão do Produtor Rural" : "Voltar para o perfil de Gestora Geral"}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors cursor-pointer"
            >
              {isGestor ? <span>🌾 Visão Produtor</span> : <span>👑 Visão Gestora</span>}
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white leading-tight">
                  {displayName}
                </div>
                <div className="text-xs text-agro-secondary/90">
                  {isGestor ? '👑 Gestora Geral' : '🌾 Produtor Rural'}
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-agro-secondary text-agro-forest font-bold flex items-center justify-center text-sm shadow-xs border border-white/30">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-white/80 hover:text-red-200 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Sair do sistema"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-22 bg-white rounded-2xl p-4 shadow-card border border-agro-border max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Módulos do Sistema</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isGestor ? 'bg-agro-secondary text-agro-forest' : 'bg-amber-100 text-amber-800'}`}>
                {isGestor ? 'GESTORA' : 'PRODUTOR'}
              </span>
            </div>

            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                        isActive
                          ? 'bg-agro-primary text-white shadow-xs'
                          : 'text-slate-600 hover:bg-agro-secondary/50 hover:text-agro-forest'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-agro-primary'}`} />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setMobileOpen(false)} 
            />

            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
              <div className="p-4 bg-agro-primary text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sprout className="w-6 h-6 text-agro-secondary" />
                  <span className="font-bold text-lg">AgroTijuco</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-white hover:bg-white/10">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                            isActive
                              ? 'bg-agro-primary text-white shadow-xs'
                              : 'text-slate-700 hover:bg-agro-secondary/50'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* MAIN ROUTE CONTENT */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-agro-border py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          AgroTijuco &copy; {new Date().getFullYear()} — Plataforma de Gestão Pecuária Inteligente (B2B SaaS).
        </div>
      </footer>
    </div>
  );
};
