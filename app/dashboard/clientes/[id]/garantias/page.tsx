'use client';

import { use, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export default function ClientWarrantiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [warranties, setWarranties] = useState<Array<{
    id: string;
    sourceCode: string;
    itemCategory: 'Produto' | 'Serviço' | 'Peça';
    warrantyMonths: number;
    item?: { name?: string };
    expiry: string;
    status: 'Ativa' | 'Expirada';
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clients/${id}/warranties`)
      .then(res => setWarranties(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando garantias...</div>;

  return (
    <Card>
      <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-neon-blue" /> Garantias Ativas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warranties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">Nenhuma garantia registrada.</TableCell>
              </TableRow>
            ) : (
                warranties.map((war) => (
                    <TableRow key={war.id}>
                      <TableCell className="text-gray-400 text-xs font-mono">{war.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-neon-blue/60">{war.sourceCode}</TableCell>
                      <TableCell className="text-white">{war.item?.name}</TableCell>
                      <TableCell className="text-gray-400">{war.itemCategory}</TableCell>
                      <TableCell className="text-gray-400">{war.warrantyMonths} m</TableCell>
                      <TableCell className="text-gray-400">{new Date(war.expiry).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant={war.status === 'Ativa' ? 'success' : 'default'}>{war.status}</Badge>
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
