'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, History, RefreshCw, ShieldCheck } from 'lucide-react';
import { AccessDenied } from '@/components/ui/access-denied';
import { PDVProvider } from './pdv-context';

const SALES_TABS = [
  { id: 'active', label: 'PDV / Frente de Caixa', icon: ShoppingCart, href: '/dashboard/vendas/em-andamento' },
  { id: 'history', label: 'Histórico', icon: History, href: '/dashboard/vendas/historico' },
  { id: 'returns', label: 'Trocas e Devoluções', icon: RefreshCw, href: '/dashboard/vendas/trocas' },
  { id: 'warranties', label: 'Garantias', icon: ShieldCheck, href: '/dashboard/vendas/garantias' },
];

export default function VendasLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  if (pathname === '/dashboard/vendas/nova') {
    return <>{children}</>;
  }

  if (!hasPermission('sales')) {
    return <AccessDenied />;
  }

  return (
    <PDVProvider>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Gestão de Vendas</h1>
          <p className="text-sm text-gray-400">Controle completo de PDV, trocas e garantias.</p>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-[rgba(255,255,255,0.06)] pb-1">
          {SALES_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
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
    </PDVProvider>
  );
}
