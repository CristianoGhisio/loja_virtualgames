'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, History } from 'lucide-react';
import { AccessDenied } from '@/components/ui/access-denied';

const STOCK_TABS = [
  { id: 'inventory', label: 'Inventário', icon: Package, href: '/dashboard/estoque/inventario' },
  { id: 'history', label: 'Histórico', icon: History, href: '/dashboard/estoque/historico' },
];

export default function EstoqueLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  if (!hasPermission('stock')) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Gestão de Estoque</h1>
        <p className="text-sm text-gray-400">Controle de inventário e movimentações.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[rgba(255,255,255,0.06)] pb-1">
        {STOCK_TABS.map((tab) => {
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
