'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

type HistorySale = {
  id: string;
  date: string;
  total: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdBy: string | null;
  customer: { name: string } | null;
};

const STATUS_LABEL: Record<HistorySale['status'], string> = {
  COMPLETED: 'Finalizada',
  CANCELLED: 'Cancelada',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function HistoricoVendasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<HistorySale[]>([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get('/sales', {
          params: {
            status: statusFilter === 'ALL' ? 'COMPLETED,CANCELLED' : statusFilter,
            search: searchTerm || undefined,
            from: from || undefined,
            to: to || undefined,
            limit: 100,
          },
        });
        const data = response.data?.data?.data;
        setSales(Array.isArray(data) ? data : []);
      } catch {
        setSales([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm, from, to, statusFilter]);

  const vendorOptions = Array.from(new Set(sales.map((sale) => sale.createdBy).filter(Boolean))) as string[];
  const filteredSales = vendorFilter === 'ALL' ? sales : sales.filter((s) => (s.createdBy || 'SEM_VENDEDOR') === vendorFilter);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">De</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Até</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'COMPLETED' | 'CANCELLED')}
                className="w-full h-10 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
              >
                <option value="ALL">Todos</option>
                <option value="COMPLETED">Finalizadas</option>
                <option value="CANCELLED">Canceladas</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Vendedor</label>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
              >
                <option value="ALL">Todos</option>
                {vendorOptions.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1 relative">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Busca</label>
              <Search className="absolute left-3 top-[34px] w-4 h-4 text-gray-400" />
              <Input placeholder="Cliente ou ID..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Carregando...</TableCell></TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Nenhuma venda encontrada.</TableCell></TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-xs text-gray-400">{sale.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-xs text-gray-400">{formatDate(sale.date)}</TableCell>
                    <TableCell className="text-white">{sale.customer?.name || '-'}</TableCell>
                    <TableCell className="font-bold text-white">{formatCurrency(sale.total)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === 'COMPLETED' ? 'success' : 'destructive'}>
                        {STATUS_LABEL[sale.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/vendas/${sale.id}`}>
                        <Button variant="ghost" size="icon" className="text-neon-blue hover:text-neon-blue hover:bg-neon-blue/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
