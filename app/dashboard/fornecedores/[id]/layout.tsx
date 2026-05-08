'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Truck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Supplier {
  id: string;
  name: string;
  createdAt: string;
}

export default function SupplierDetailLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const [supplier, setSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await api.get(`/suppliers/${id}`);
        setSupplier(res.data);
      } catch (error) {
        console.error('Failed to fetch supplier header', error);
      }
    };
    fetchSupplier();
  }, [id]);

  const TABS = [
    { label: 'Visão Geral', href: `/dashboard/fornecedores/${id}/visao-geral`, icon: Truck },
    { label: 'Interações', href: `/dashboard/fornecedores/${id}/interacoes`, icon: MessageSquare },
  ];

  if (!supplier) {
    return <div className="p-8 text-center text-gray-400">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/fornecedores')} className="text-gray-400 hover:text-white hover:bg-white/5 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron truncate">{supplier.name}</h1>
          <p className="text-xs sm:text-sm text-gray-400 truncate">ID: {supplier.id} • Parceiro desde {new Date(supplier.createdAt).getFullYear()}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[rgba(255,255,255,0.06)] pb-1 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-neon-blue/10 text-neon-blue border-b-2 border-neon-blue'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="min-h-[400px]">{children}</div>
    </div>
  );
}
