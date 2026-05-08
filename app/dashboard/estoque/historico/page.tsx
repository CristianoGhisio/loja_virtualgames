'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MovementsTable } from '@/components/dashboard/estoque/movements-table';

export default function HistoricoMovimentacoesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        <MovementsTable />
      </CardContent>
    </Card>
  );
}
