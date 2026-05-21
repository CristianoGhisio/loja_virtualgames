'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface StockMovement {
  id: string;
  createdAt: string;
  type: string;
  quantity: number;
  reason: string;
  product: {
    id: string;
    commercialName: string;
  };
}

export function MovementsTable({ type }: { type?: 'Entrada' | 'Saída' }) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      const url = '/stock/movement?limit=50';
      // Map UI type to API type prefix if needed, but for now we fetch all and filter or API supports specific types
      // The API supports 'type' param but our UI type is generic 'Entrada'/'Saída' while API has granular types.
      // For simplicity, we'll fetch all and filter in UI or we could map them.

      const response = await api.get(url);
      let data: StockMovement[] = response.data.data || [];

      if (type === 'Entrada') {
        data = data.filter(m => m.type.startsWith('IN_'));
      } else if (type === 'Saída') {
        data = data.filter(m => m.type.startsWith('OUT_'));
      }

      setMovements(data);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const getTypeLabel = (type: string) => {
    if (type.startsWith('IN_')) return 'Entrada';
    if (type.startsWith('OUT_')) return 'Saída';
    return type;
  };

  const getReasonLabel = (reason: string) => {
    // Clean up reason if it has " - " details
    return reason.split(' - ')[0];
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          {!type && <TableHead>Tipo</TableHead>}
          <TableHead>Produto</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead>Quantidade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-400">Carregando...</TableCell>
          </TableRow>
        ) : movements.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-400">Nenhuma movimentação encontrada</TableCell>
          </TableRow>
        ) : (
          movements.map((mov) => {
            const isIn = mov.type.startsWith('IN_');
            return (
              <TableRow key={mov.id}>
                <TableCell>{new Date(mov.createdAt).toLocaleDateString('pt-BR')} {new Date(mov.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                {!type && (
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={isIn ? 'text-neon-blue border-neon-blue/50' : 'text-red-500 border-red-500/50'}
                    >
                      {getTypeLabel(mov.type)}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="font-medium text-white">{mov.product?.commercialName || 'Produto desconhecido'}</TableCell>
                <TableCell>{getReasonLabel(mov.reason)}</TableCell>
                <TableCell className={`font-bold ${isIn ? 'text-green-400' : 'text-red-400'}`}>
                  {isIn ? '+' : '-'}{mov.quantity}
                </TableCell>
              </TableRow>
            )
          }))}
      </TableBody>
    </Table>
  );
}
