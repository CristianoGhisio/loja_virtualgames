'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, TrendingUp, TrendingDown, Users, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

interface TopClient {
  id: string;
  name: string;
  document: string;
  creditBalance: number;
  lastEntryDate: string | null;
}

interface Summary {
  totalGranted: number;
  totalUsed: number;
  totalActive: number;
  clientsWithCredit: number;
  topClients: TopClient[];
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CreditosDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchData = async (query?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      const res = await api.get(`/credits/summary?${params.toString()}`);
      setSummary(res.data?.data ?? null);
    } catch (err) {
      console.error('Erro ao carregar resumo de créditos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchData(searchTerm);
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm]);

  if (loading && !summary) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Crédito Concedido</p>
                <p className="text-xl font-bold text-white">{fmt(summary?.totalGranted ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Crédito Utilizado</p>
                <p className="text-xl font-bold text-white">{fmt(summary?.totalUsed ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Saldo Ativo Total</p>
                <p className="text-xl font-bold text-white">{fmt(summary?.totalActive ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Clientes com Crédito</p>
                <p className="text-xl font-bold text-white">{summary?.clientsWithCredit ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-neon-blue" />
            Clientes com Crédito Ativo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou documento..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Última Movimentação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!summary?.topClients || summary.topClients.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                    Nenhum cliente com crédito ativo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                summary.topClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-white">{client.name}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{client.document}</TableCell>
                    <TableCell className="font-bold text-yellow-400">{fmt(client.creditBalance)}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {client.lastEntryDate
                        ? new Date(client.lastEntryDate).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/clientes/${client.id}/creditos`)}
                      >
                        Ver Extrato
                      </Button>
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
