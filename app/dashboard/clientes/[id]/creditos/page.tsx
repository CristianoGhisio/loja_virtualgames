'use client';

import { use, useEffect, useState } from 'react';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface CreditEntry {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'EXPIRED' | 'ADJUSTMENT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId: string | null;
  referenceType: string | null;
  saleId: string | null;
  productId: string | null;
  createdAt: string;
}

export default function CreditosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [balance, setBalance] = useState(0);
  const [entries, setEntries] = useState<CreditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/clients/${id}/credit`);
        setBalance(Number(res.data?.data?.balance ?? 0));
        setEntries(res.data?.data?.entries ?? []);
      } catch (err) {
        console.error('Erro ao carregar créditos', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const filteredEntries = filterType === 'all'
    ? entries
    : entries.filter((e) => e.type === filterType);

  const typeLabel: Record<string, string> = {
    CREDIT: 'Crédito',
    DEBIT: 'Débito',
    EXPIRED: 'Expirado',
    ADJUSTMENT: 'Ajuste',
  };

  const typeColor: Record<string, string> = {
    CREDIT: 'border-emerald-400/30 text-emerald-400',
    DEBIT: 'border-rose-400/30 text-rose-400',
    EXPIRED: 'border-gray-400/30 text-gray-400',
    ADJUSTMENT: 'border-blue-400/30 text-blue-400',
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Carregando créditos...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            Saldo de Crédito
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-4xl font-bold text-yellow-400">{fmt(balance)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <CardTitle className="flex items-center gap-2">
            {filterType === 'CREDIT' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> :
             filterType === 'DEBIT' ? <TrendingDown className="w-5 h-5 text-rose-400" /> :
             <Coins className="w-5 h-5 text-neon-blue" />}
            Extrato de Movimentações
          </CardTitle>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue"
          >
            <option value="all">Todos os tipos</option>
            <option value="CREDIT">Crédito</option>
            <option value="DEBIT">Débito</option>
            <option value="EXPIRED">Expirado</option>
            <option value="ADJUSTMENT">Ajuste</option>
          </select>
        </CardHeader>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Saldo Anterior</TableHead>
                <TableHead>Saldo Posterior</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    Nenhuma movimentação de crédito encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                      <div className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColor[entry.type]}>
                        {typeLabel[entry.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-xs truncate">{entry.description}</TableCell>
                    <TableCell className={`font-bold ${entry.type === 'CREDIT' || entry.type === 'ADJUSTMENT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.type === 'CREDIT' || entry.type === 'ADJUSTMENT' ? '+' : '-'}{fmt(entry.amount)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{fmt(entry.balanceBefore)}</TableCell>
                    <TableCell className="text-gray-300 text-sm font-medium">{fmt(entry.balanceAfter)}</TableCell>
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
