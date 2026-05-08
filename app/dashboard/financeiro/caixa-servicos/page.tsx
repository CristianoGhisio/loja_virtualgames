
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function CaixaServicosPage() {
  const transactions = await prisma.receivable.findMany({
    where: {
      serviceOrderId: { not: null },
      status: 'PAID',
    },
    include: {
      serviceOrder: true,
      customer: true,
    },
    orderBy: {
      dueDate: 'desc',
    },
  });

  const totalAmount = transactions.reduce((acc, curr) => acc + Number(curr.value), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido (Serviços)</CardTitle>
            <Wallet className="h-4 w-4 text-neon-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-blue">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total acumulado de serviços pagos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-neon-blue" /> Histórico de Recebimentos de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>OS</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum recebimento de serviço registrado.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {format(new Date(t.dueDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium text-white">{t.description}</TableCell>
                    <TableCell>{t.customer?.name || 'Cliente Removido'}</TableCell>
                    <TableCell>
                        <Badge variant="outline">
                            #{t.serviceOrderId?.slice(-6).toUpperCase()}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-400">
                      {formatCurrency(Number(t.value))}
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
