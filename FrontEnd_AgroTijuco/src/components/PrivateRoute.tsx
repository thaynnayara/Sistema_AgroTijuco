import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const PrivateRoute: React.FC = () => {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-agro-bg flex flex-col items-center justify-center text-agro-dark">
        <Loader2 className="w-10 h-10 animate-spin text-agro-primary mb-3" />
        <span className="font-semibold text-sm">Carregando AgroTijuco...</span>
      </div>
    );
  }

  return signed ? <Outlet /> : <Navigate to="/login" replace />;
};
