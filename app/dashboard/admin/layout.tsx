'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCog, Users, ShieldAlert, FileText } from 'lucide-react';
import { AccessDenied } from '@/components/ui/access-denied';

const ADMIN_TABS = [
  { id: 'users', label: 'Usuários', icon: UserCog, href: '/dashboard/admin/usuarios' },
  { id: 'roles', label: 'Perfis', icon: Users, href: '/dashboard/admin/perfis' },
  { id: 'permissions', label: 'Permissões', icon: ShieldAlert, href: '/dashboard/admin/permissoes' },
  { id: 'logs', label: 'Logs do Sistema', icon: FileText, href: '/dashboard/admin/logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  if (!hasPermission('admin')) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Administração do Sistema</h1>
        <p className="text-sm text-gray-400">Gestão de usuários, permissões e logs de segurança.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[rgba(255,255,255,0.06)] pb-1">
        {ADMIN_TABS.map((tab) => {
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
