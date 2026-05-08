'use client';

import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_STALLED_STOCK = [
  { id: '1', product: 'FIFA 21 (PS4)', days: 180, quantity: 15, value: 59.90 },
  { id: '2', product: 'Cabo HDMI Genérico', days: 120, quantity: 50, value: 15.00 },
  { id: '3', product: 'Capinha Switch Rosa', days: 90, quantity: 8, value: 25.00 },
];

export default function EstoqueReportPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-400" /> Produtos Sem Giro (Estoque Parado)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Dias Parado</TableHead>
              <TableHead>Qtd. Atual</TableHead>
              <TableHead>Valor Unit.</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_STALLED_STOCK.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-white">{item.product}</TableCell>
                <TableCell className="text-red-400 font-bold">{item.days} dias</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                <TableCell className="text-right font-bold">
                  {(item.quantity * item.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
