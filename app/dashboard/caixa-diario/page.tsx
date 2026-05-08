'use client';

import DiarioPage from '@/app/dashboard/financeiro/diario/page';

export default function CaixaDiarioPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-neon-blue font-orbitron">Abertura/Fechamento de Caixa</h1>
        <p className="text-sm text-gray-400">Controle de abertura, suprimento, sangria e fechamento operacional do caixa.</p>
      </div>
      <DiarioPage />
    </div>
  );
}
