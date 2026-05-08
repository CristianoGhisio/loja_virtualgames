'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LineChart, Star } from 'lucide-react';
import { AccessDenied } from '@/components/ui/access-denied';

const REPORTS_TABS = [
  { id: 'managerial', label: 'Relatórios Gerenciais', icon: LineChart, href: '/dashboard/relatorios/gerencial' },
  { id: 'satisfaction', label: 'Avaliações', icon: Star, href: '/dashboard/relatorios/avaliacoes' },
];

export default function RelatoriosLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  if (!hasPermission('reports')) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Relatórios Gerenciais</h1>
        <p className="text-sm text-gray-400">Análise detalhada de performance e resultados.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[rgba(255,255,255,0.06)] pb-1">
        {REPORTS_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-neon-blue/10 text-neon-blue border-b-2 border-neon-blue'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="min-h-[400px]">{children}</div>
    </div>
  );
}
