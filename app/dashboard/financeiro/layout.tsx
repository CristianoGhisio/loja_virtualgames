'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, FileClock, FileWarning, ShieldCheck, BarChart3 } from 'lucide-react';
import { AccessDenied } from '@/components/ui/access-denied';

const FINANCIAL_TABS = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, href: '/dashboard/financeiro/visao-geral' },
  { id: 'receivables', label: 'Receitas', icon: FileClock, href: '/dashboard/financeiro/receber' },
  { id: 'payables', label: 'Despesas', icon: FileWarning, href: '/dashboard/financeiro/pagar' },
  { id: 'reconciliation', label: 'Conciliação', icon: ShieldCheck, href: '/dashboard/financeiro/conciliacao' },
  { id: 'dre', label: 'DRE Gerencial', icon: BarChart3, href: '/dashboard/financeiro/dre' },
  { id: 'flow', label: 'Fluxo de Caixa', icon: TrendingUp, href: '/dashboard/financeiro/fluxo' },
];

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  if (!hasPermission('financial') && !hasPermission('finance')) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Gestão Financeira</h1>
        <p className="text-sm text-gray-400">Controle total de fluxo de caixa, contas e demonstrativos.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[rgba(255,255,255,0.06)] pb-1">
        {FINANCIAL_TABS.map((tab) => {
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
  );
}
