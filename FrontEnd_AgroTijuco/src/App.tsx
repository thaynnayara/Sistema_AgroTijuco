import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FarmProvider } from './contexts/FarmContext';
import { PrivateRoute } from './components/PrivateRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Usuarios } from './pages/Usuarios';
import { Propriedades } from './pages/Propriedades';
import { Animais } from './pages/Animais';
import { Pesagens } from './pages/Pesagens';
import { Reprodutivo } from './pages/Reprodutivo';
import { Sanidade } from './pages/Sanidade';
import { Pastagens } from './pages/Pastagens';
import { Nutricao } from './pages/Nutricao';
import { Estoque } from './pages/Estoque';
import { Financeiro } from './pages/Financeiro';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FarmProvider>
        <BrowserRouter>
          <Routes>
            {/* Rota Pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas Privadas no Layout Principal */}
            <Route element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/produtores" element={<Navigate to="/propriedades" replace />} />
                <Route path="/propriedades" element={<Propriedades />} />
                <Route path="/animais" element={<Animais />} />
                <Route path="/pesagens" element={<Pesagens />} />
                <Route path="/reproducao" element={<Reprodutivo />} />
                <Route path="/sanidade" element={<Sanidade />} />
                <Route path="/pastagens" element={<Pastagens />} />
                <Route path="/nutricao" element={<Nutricao />} />
                <Route path="/estoque" element={<Estoque />} />
                <Route path="/financeiro" element={<Financeiro />} />
              </Route>
            </Route>

            {/* Redirecionamento Padrão */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </FarmProvider>
    </AuthProvider>
  );
};

export default App;
