'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export default function ClientPurchasesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sales, setSales] = useState<{ id: string; date: string; itemsCount: number; total: number; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clients/${id}/sales`)
      .then(res => setSales(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Carregando compras...</div>;
  }

  return (
    <Card>
      <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-neon-blue" /> Compras Realizadas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>ID Venda</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">Nenhuma compra registrada.</TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-gray-400">{new Date(sale.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-mono text-neon-blue/60 text-xs">{sale.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-gray-400">{sale.itemsCount}</TableCell>
                  <TableCell className="font-bold text-neon-blue">
                    {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sale.status === 'Finalizada' ? 'success' : 'default'}>{sale.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/vendas/${sale.id}`}>
                      <Button variant="ghost" size="sm">Ver Detalhes</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
