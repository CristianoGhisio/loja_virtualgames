'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, CreditCard, Database, MessageCircle } from 'lucide-react';
import { AccessDenied } from '@/components/ui/access-denied';

const SETTINGS_TABS = [
  { id: 'general', label: 'Geral', icon: Settings, href: '/dashboard/configuracoes/geral' },
  { id: 'payment', label: 'Pagamentos', icon: CreditCard, href: '/dashboard/configuracoes/pagamentos' },
  { id: 'backup', label: 'Backup', icon: Database, href: '/dashboard/configuracoes/backup' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, href: '/dashboard/configuracoes/whatsapp' },
];

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  if (!hasPermission('settings')) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Configurações</h1>
        <p className="text-sm text-gray-400">Preferências gerais do sistema e dispositivos.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[rgba(255,255,255,0.06)] pb-1">
        {SETTINGS_TABS.map((tab) => {
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
