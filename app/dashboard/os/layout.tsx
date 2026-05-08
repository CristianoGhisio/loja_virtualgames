'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Inbox, Stethoscope, Wrench, Clock, CheckCircle, XCircle, 
  UserCheck, ThumbsUp, PackageCheck 
} from 'lucide-react';
import { AccessDenied } from '@/components/ui/access-denied';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

const OS_TABS = [
  { id: 'overview', label: 'Nova OS', icon: LayoutDashboard, href: '/dashboard/os/visao-geral' },
  { id: 'entry', label: 'Entrada', icon: Inbox, href: '/dashboard/os/entrada', status: 'ENTRADA' },
  { id: 'diagnosis', label: 'Diag. / Orçamento', icon: Stethoscope, href: '/dashboard/os/diagnostico', status: 'DIAGNOSTICO' },
  { id: 'approval', label: 'Aguard. Aprovação', icon: UserCheck, href: '/dashboard/os/aguardando-aprovacao', status: 'AGUARDANDO_APROVACAO' },
  { id: 'approved', label: 'Aprovado', icon: ThumbsUp, href: '/dashboard/os/aprovado', status: 'APROVADO' },
  { id: 'repair', label: 'Em Reparo', icon: Wrench, href: '/dashboard/os/reparo', status: 'EM_REPARO' },
  { id: 'waiting', label: 'Aguard. Peça', icon: Clock, href: '/dashboard/os/aguardando-peca', status: 'AGUARDANDO_PECA' },
  { id: 'finished', label: 'Finalizadas', icon: CheckCircle, href: '/dashboard/os/finalizadas', status: 'FINALIZADO' },
  { id: 'cancelled', label: 'Canceladas', icon: XCircle, href: '/dashboard/os/canceladas', status: 'CANCELADO' },
  { id: 'delivered', label: 'Entregues', icon: PackageCheck, href: '/dashboard/os/entregue', status: 'ENTREGUE' },
];

export default function OSLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchStats() {
        try {
            const response = await api.get('/os/stats');
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Error fetching OS stats:', error);
        }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  const isListPage = OS_TABS.some(tab => pathname === tab.href);

  if (!hasPermission('os')) {
    return <AccessDenied />;
  }

  if (!isListPage) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Ordens de Serviço</h1>
        <p className="text-sm text-gray-400">Gestão completa de manutenção e reparos.</p>
      </div>

      <div className="flex overflow-x-auto pb-1 gap-1 border-b border-[rgba(255,255,255,0.06)] no-scrollbar">
        {OS_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const count = tab.status ? stats[tab.status] || 0 : 0;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-t-lg transition-all duration-200 text-xs sm:text-sm font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-neon-blue/10 text-neon-blue border-b-2 border-neon-blue'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.replace(/[aeiou]/g, '').substring(0, 4).toUpperCase()}</span>
              {count > 0 && (
                <Badge variant={isActive ? 'neon' : 'default'} className="h-5 px-1.5 text-[10px]">
                  {count}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      <div className="min-h-[400px]">{children}</div>
    </div>
  );
}
