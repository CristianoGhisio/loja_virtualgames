import { prisma } from '@/lib/prisma';
import { ArrowUpRight, ArrowDownRight, DollarSign, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { RealtimePanel } from './realtime-panel';

export const dynamic = 'force-dynamic';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VisaoGeralPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const month = Number(params.month) || new Date().getMonth() + 1;
  const year = Number(params.year) || new Date().getFullYear();
  const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const [monthlyPaidReceivables, monthlyPaidPayables, paidEntriesByDay, paidExitsByDay, monthlyCommissionProvisions] = await Promise.all([
    prisma.receivable.findMany({ where: { status: 'PAID', paidAt: { gte: monthStart, lte: monthEnd } } }),
    prisma.payable.findMany({ where: { status: 'PAID', updatedAt: { gte: monthStart, lte: monthEnd } }, include: { costCenter: true } }),
    prisma.receivable.groupBy({ by: ['paidAt'], where: { status: 'PAID', paidAt: { gte: monthStart, lte: monthEnd } }, _sum: { netValue: true, value: true }, orderBy: { paidAt: 'asc' } }),
    prisma.payable.groupBy({ by: ['updatedAt'], where: { status: 'PAID', updatedAt: { gte: monthStart, lte: monthEnd } }, _sum: { value: true }, orderBy: { updatedAt: 'asc' } }),
    prisma.serviceCommissionProvision.findMany({ where: { competenceMonth: month, competenceYear: year, status: 'PROVISIONED' } }),
  ]);

  const entradasMes = monthlyPaidReceivables.reduce((acc, item) => acc + Number(item.netValue ?? item.value), 0);
  const saidasMes = monthlyPaidPayables.reduce((acc, item) => acc + Number(item.value), 0);
  const comissaoAPagarMes = monthlyCommissionProvisions.reduce((acc, item) => acc + Number(item.commissionAmount), 0);
  const saldoAtual = entradasMes - saidasMes - comissaoAPagarMes;

  const trendMap = new Map<string, { in: number; out: number; commission: number }>();

  for (const item of paidEntriesByDay) {
    const key = item.paidAt ? format(new Date(item.paidAt), 'dd/MM') : '';
    if (!key) continue;
    if (!trendMap.has(key)) trendMap.set(key, { in: 0, out: 0, commission: 0 });
    trendMap.get(key)!.in += Number(item._sum.netValue ?? item._sum.value ?? 0);
  }

  for (const item of paidExitsByDay) {
    const key = item.updatedAt ? format(new Date(item.updatedAt), 'dd/MM') : '';
    if (!key) continue;
    if (!trendMap.has(key)) trendMap.set(key, { in: 0, out: 0, commission: 0 });
    trendMap.get(key)!.out += Number(item._sum.value ?? 0);
  }

  const trendData = Array.from(trendMap.entries())
    .map(([date, data]) => ({ date, ...data, commission: comissaoAPagarMes / Math.max(1, trendMap.size) }))
    .slice(-15);

  const maxTrend = Math.max(1, ...trendData.map((item) => Math.max(item.in, item.out)));

  return (
    <div className="space-y-6 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-end justify-between">
          <form className="flex gap-3 items-end" method="GET">
            <div>
              <label className="text-xs text-gray-400">Mês</label>
              <select name="month" defaultValue={String(month)}
                className="block h-10 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Ano</label>
              <select name="year" defaultValue={String(year)}
                className="block h-10 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue">
                {[year - 2, year - 1, year, year + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm" variant="neon">Aplicar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Entradas (Mês)</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(entradasMes)}</h3>
              </div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl"><ArrowUpRight className="w-5 h-5 text-emerald-400" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Saídas (Mês)</p>
                <h3 className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(saidasMes)}</h3>
              </div>
              <div className="p-2.5 bg-rose-500/15 rounded-xl"><ArrowDownRight className="w-5 h-5 text-rose-400" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Saldo Líquido (Mês)</p>
                <h3 className={`text-2xl font-bold mt-1 ${saldoAtual >= 0 ? 'text-neon-blue' : 'text-red-400'}`}>{formatCurrency(saldoAtual)}</h3>
              </div>
              <div className="p-2.5 bg-neon-blue/15 rounded-xl"><DollarSign className="w-5 h-5 text-neon-blue" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Comissão a Pagar</p>
              <h3 className="text-xl font-bold text-amber-400 mt-1">{formatCurrency(comissaoAPagarMes)}</h3>
            </div>
            <Receipt className="w-5 h-5 text-neon-blue" />
          </CardContent>
        </Card>
      </div>

      <RealtimePanel />

      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-bold uppercase text-neon-blue mb-4">Tendência diária (Entradas x Saídas x Comissão)</h3>
          <div className="space-y-2">
            {trendData.length === 0 ? (
              <div className="text-sm text-gray-400 py-4">Sem movimentações pagas no período selecionado.</div>
            ) : (
              trendData.map((item) => (
                <div key={item.date} className="grid grid-cols-[56px_1fr_1fr_1fr] gap-2 items-center">
                  <span className="text-xs text-gray-400">{item.date}</span>
                  <div className="h-3 rounded bg-white/[0.04] overflow-hidden border border-[rgba(255,255,255,0.06)]">
                    <div className="h-3 bg-emerald-400 rounded" style={{ width: `${(item.in / maxTrend) * 100}%` }} />
                  </div>
                  <div className="h-3 rounded bg-white/[0.04] overflow-hidden border border-[rgba(255,255,255,0.06)]">
                    <div className="h-3 bg-rose-400 rounded" style={{ width: `${(item.out / maxTrend) * 100}%` }} />
                  </div>
                  <div className="h-3 rounded bg-white/[0.04] overflow-hidden border border-[rgba(255,255,255,0.06)]">
                    <div className="h-3 bg-amber-400 rounded" style={{ width: `${(item.commission / maxTrend) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
