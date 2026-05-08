'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

type SummaryData = {
  overallAverage: number;
  salesAverage: number;
  servicesAverage: number;
  totalResponses: number;
  saleResponses: number;
  serviceResponses: number;
  pendingRequests: number;
  responseRate: number;
};

type DistributionItem = {
  rating: number;
  count: number;
};

type LatestItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customerName: string;
  type: 'VENDA' | 'SERVIÇO';
};

const defaultSummary: SummaryData = {
  overallAverage: 0,
  salesAverage: 0,
  servicesAverage: 0,
  totalResponses: 0,
  saleResponses: 0,
  serviceResponses: 0,
  pendingRequests: 0,
  responseRate: 0,
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`w-3.5 h-3.5 ${value <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
        />
      ))}
    </div>
  );
}

export default function AvaliacoesReportPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData>(defaultSummary);
  const [salesDistribution, setSalesDistribution] = useState<DistributionItem[]>([]);
  const [servicesDistribution, setServicesDistribution] = useState<DistributionItem[]>([]);
  const [latest, setLatest] = useState<LatestItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get('/reports/satisfaction');
        const payload = response.data?.data ?? {};
        setSummary(payload.summary ?? defaultSummary);
        setSalesDistribution(Array.isArray(payload.distribution?.sales) ? payload.distribution.sales : []);
        setServicesDistribution(Array.isArray(payload.distribution?.services) ? payload.distribution.services : []);
        setLatest(Array.isArray(payload.latest) ? payload.latest : []);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const unifiedDistribution = useMemo(() => {
    const map = new Map<number, { sales: number; services: number }>();
    for (const value of [1, 2, 3, 4, 5]) {
      map.set(value, { sales: 0, services: 0 });
    }
    for (const item of salesDistribution) {
      const current = map.get(item.rating);
      if (current) current.sales = item.count;
    }
    for (const item of servicesDistribution) {
      const current = map.get(item.rating);
      if (current) current.services = item.count;
    }
    return Array.from(map.entries()).map(([rating, values]) => ({ rating, ...values }));
  }, [salesDistribution, servicesDistribution]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-gray-300">Avaliações de Clientes</CardTitle>
          <CardDescription className="text-slate-400">Indicadores de satisfação em vendas e serviços</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-[#0f172a] border-cyan-400/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Média Geral</CardDescription>
            <CardTitle className="text-3xl text-yellow-400">{summary.overallAverage.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Stars rating={Math.round(summary.overallAverage)} />
          </CardContent>
        </Card>
        <Card className="bg-[#0f172a] border-cyan-400/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Resposta da Pesquisa</CardDescription>
            <CardTitle className="text-3xl text-neon-blue">{summary.responseRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
            {summary.totalResponses} respostas | {summary.pendingRequests} pendentes
          </CardContent>
        </Card>
        <Card className="bg-[#0f172a] border-cyan-400/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Avaliações de Atendimento em Venda</CardDescription>
            <CardTitle className="text-3xl text-green-400">{summary.salesAverage.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
            {summary.saleResponses} respostas
          </CardContent>
        </Card>
        <Card className="bg-[#0f172a] border-cyan-400/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Avaliações de Serviço</CardDescription>
            <CardTitle className="text-3xl text-purple-400">{summary.servicesAverage.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
            {summary.serviceResponses} respostas
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-gray-300">Distribuição das Notas</CardTitle>
          <CardDescription className="text-slate-400">Comparativo por nota entre vendas e serviços</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
            <Table className="w-full min-w-[900px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Nota</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Atendimento em Venda</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Serviço Realizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unifiedDistribution.map((item) => (
                  <TableRow key={item.rating} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                    <TableCell className="px-3 py-3 font-medium text-slate-100 border-b-0">{item.rating}</TableCell>
                    <TableCell className="px-3 py-3 text-slate-200 border-b-0">{item.sales}</TableCell>
                    <TableCell className="px-3 py-3 text-slate-200 border-b-0">{item.services}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-gray-300">Últimas Avaliações</CardTitle>
          <CardDescription className="text-slate-400">Histórico recente de comentários e notas dos clientes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400">Carregando avaliações...</p>
          ) : (
            <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
              <Table className="w-full min-w-[1100px] border-separate border-spacing-y-2">
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Data</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Cliente</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Tipo</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Nota</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Comentário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latest.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400 border-b-0">
                        Nenhuma avaliação registrada no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    latest.map((item) => (
                      <TableRow key={item.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                        <TableCell className="px-3 py-3 text-slate-200 border-b-0">{new Date(item.createdAt).toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="px-3 py-3 text-slate-100 font-medium border-b-0">{item.customerName}</TableCell>
                        <TableCell className="px-3 py-3 border-b-0">
                          <Badge variant="neon">{item.type}</Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3 border-b-0">
                          <div className="flex items-center gap-2 text-slate-200">
                            <span>{item.rating}</span>
                            <Stars rating={item.rating} />
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-slate-200 border-b-0">{item.comment || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
