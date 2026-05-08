'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BrainCircuit } from 'lucide-react';

type ForecastRow = {
  date: string;
  entry: number;
  exit: number;
  net: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function ForecastPanel() {
  const [forecast, setForecast] = useState<ForecastRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const to = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().slice(0, 10);
      
      const response = await api.get('/financial/intelligence', { params: { from, to } });
      const payload = response.data?.data;
      if (payload?.forecast) {
        setForecast(payload.forecast);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading && forecast.length === 0) {
    return <div className="text-sm text-gray-400 animate-pulse">Carregando previsão inteligente...</div>;
  }

  if (forecast.length === 0) return null;

  return (
    <Card className="bg-[#1e1e26] border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase text-white">
          <BrainCircuit className="w-4 h-4 text-neon-blue" />
          Previsão Inteligente de Fluxo de Caixa (Próximos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Entradas (Ajustadas)</TableHead>
              <TableHead className="text-right">Saídas</TableHead>
              <TableHead className="text-right">Resultado Diário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forecast.slice(0, 30).map((item) => (
              <TableRow key={item.date}>
                <TableCell>{new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                <TableCell className="text-right text-green-400">{formatCurrency(item.entry)}</TableCell>
                <TableCell className="text-right text-red-400">{formatCurrency(item.exit)}</TableCell>
                <TableCell className={`text-right font-semibold ${item.net >= 0 ? 'text-neon-blue' : 'text-red-500'}`}>
                  {formatCurrency(item.net)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-3 text-xs text-gray-500">
          * A previsão inteligente aplica um fator de atraso com base no histórico de pagamentos para estimar as entradas reais.
        </div>
      </CardContent>
    </Card>
  );
}