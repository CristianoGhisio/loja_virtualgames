'use client';

import { useMemo, useState } from 'react';
import { Fragment } from 'react';
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type DetailItem = {
  id: string;
  date: string;
  description: string;
  value: number;
  type: 'IN' | 'OUT';
};

type CashFlowItem = {
  date: string;
  entry: number;
  exit: number;
  balance: number;
  projected: number;
};

interface Props {
  cashFlow: CashFlowItem[];
  detailItems: DetailItem[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function FlowTableClient({ cashFlow, detailItems }: Props) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const detailsByDate = useMemo(() => {
    return detailItems.reduce<Record<string, DetailItem[]>>((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    }, {});
  }, [detailItems]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Entradas</TableHead>
          <TableHead className="text-right">Saídas</TableHead>
          <TableHead className="text-right">Saldo do Dia</TableHead>
          <TableHead className="text-right">Saldo Projetado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cashFlow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação no período selecionado.
            </TableCell>
          </TableRow>
        ) : (
          cashFlow.map((item) => {
            const isExpanded = expandedDate === item.date;
            const details = detailsByDate[item.date] ?? [];
            return (
              <Fragment key={item.date}>
                <TableRow
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => setExpandedDate(isExpanded ? null : item.date)}
                >
                  <TableCell>{format(parseISO(item.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right text-green-400">{formatCurrency(item.entry)}</TableCell>
                  <TableCell className="text-right text-red-400">{formatCurrency(item.exit)}</TableCell>
                  <TableCell className={`text-right font-bold ${item.balance >= 0 ? 'text-white' : 'text-red-500'}`}>
                    {formatCurrency(item.balance)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${item.projected >= 0 ? 'text-[#00b5ff]' : 'text-red-500'}`}>
                    {formatCurrency(item.projected)}
                  </TableCell>
                </TableRow>
                {isExpanded ? (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-black/20">
                      <div className="space-y-1 py-2">
                        {details.length === 0 ? (
                          <div className="text-xs text-gray-400">Sem composição detalhada para a data.</div>
                        ) : (
                          details.map((detail) => (
                            <div key={detail.id} className={`text-xs ${detail.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                              {detail.type === 'IN' ? '+' : '-'} {detail.description} ({formatCurrency(detail.value)})
                            </div>
                          ))
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
