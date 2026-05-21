'use client';

import { useAuth } from '@/contexts/auth-context';

export default function ModulePage({ 
  title, 
  permission 
}: { 
  title: string, 
  permission: string 
}) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <button className="bg-neon-blue text-black px-4 py-2 rounded font-bold hover:bg-blue-400 transition-colors">
          + Novo
        </button>
      </div>
      
      <div className="bg-card-bg border border-white/5 rounded-xl p-8 text-center py-20">
        <p className="text-gray-400 text-lg">Módulo em Desenvolvimento</p>
        <p className="text-gray-600 text-sm mt-2">Funcionalidade mockada para demonstração de navegação.</p>
      </div>
    </div>
  );
}
