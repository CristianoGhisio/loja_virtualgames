'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Wrench, Tags, Factory, List, Truck, Archive, Printer } from 'lucide-react';
import { AccessDenied } from '@/components/ui/access-denied';

const CADASTRO_TABS = [
  { id: 'fornecedores', label: 'Fornecedores', icon: Truck, href: '/dashboard/controle/fornecedores' },
  { id: 'categorias', label: 'Categorias', icon: Tags, href: '/dashboard/controle/categorias' },
  { id: 'fabricantes', label: 'Fabricantes', icon: Factory, href: '/dashboard/controle/fabricantes' },
  { id: 'atributos', label: 'Atributos', icon: List, href: '/dashboard/controle/atributos' },
  { id: 'produtos', label: 'Produtos', icon: Package, href: '/dashboard/controle/produtos' },
  { id: 'impressao', label: 'Impressão', icon: Printer, href: '/dashboard/controle/impressao' },
  { id: 'estoque', label: 'Estoque', icon: Archive, href: '/dashboard/controle/estoque' },
  { id: 'servicos', label: 'Serviços', icon: Wrench, href: '/dashboard/controle/servicos' },
];

export default function CadastrosLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  if (!hasPermission('registers') && !hasPermission('products')) return <AccessDenied />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron mb-1">Controle de Produtos</h1>
        <p className="text-sm text-gray-400">Gerencie fornecedores, cadastros e estoque de produtos.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[rgba(255,255,255,0.06)] pb-1">
        {CADASTRO_TABS.map((tab) => {
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
