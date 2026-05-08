'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import {
  TrendingUp,
  Download,
  RefreshCw,
  X,
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/native-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Period = 'today' | '7d' | '30d' | 'month' | 'custom';
type RowStatus = 'CONFIRMADO' | 'PENDENTE' | 'ATRASADO';
type RowSource = 'RECEIVABLE' | 'PAYABLE';
type RowOrigin = 'MANUAL' | 'SALE' | 'SERVICE' | 'PAYABLE';

type CashFlowRow = {
  id: string;
  source: RowSource;
  origin: RowOrigin;
  date: string;
  description: string;
  category: string;
  account: string;
  value: number;
  direction: 'IN' | 'OUT';
  status: RowStatus;
  reconciled: boolean;
};

type ChartItem = {
  date: string;
  entry: number;
  exit: number;
  commissionProjectedOut: number;
  accumulated: number;
  accumulatedWithCommission: number;
};

type CashFlowPayload = {
  period: { start: string; end: string };
  kpis: {
    saldoAtual: number;
    totalEntradas: number;
    totalSaidas: number;
    resultadoLiquido: number;
    comissaoProjetadaPeriodo: number;
    saldoProjetadoComComissao: number;
  };
  reserve: {
    currentBalance: number;
    targetBalance: number;
    coverageMonths: number;
  };
  chart: ChartItem[];
  rows: CashFlowRow[];
  options: {
    accounts: string[];
    categories: string[];
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const defaultDates = () => ({
  from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
});

function statusBadge(status: RowStatus) {
  if (status === 'CONFIRMADO') return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40';
  if (status === 'ATRASADO') return 'bg-rose-500/15 text-rose-400 border border-rose-500/40';
  return 'bg-amber-500/15 text-amber-400 border border-amber-500/40';
}

function categoryBadgeColor(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('venda')) return 'bg-cyan-500/15 text-gray-300 border-cyan-400/40';
  if (normalized.includes('marketing')) return 'bg-violet-500/15 text-violet-300 border-violet-400/40';
  if (normalized.includes('admin')) return 'bg-orange-500/15 text-orange-300 border-orange-400/40';
  return 'bg-slate-500/15 text-slate-300 border-slate-400/40';
}

function sourceBadge(source: RowSource) {
  if (source === 'RECEIVABLE') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40';
  return 'bg-rose-500/15 text-rose-300 border-rose-400/40';
}

function CashFlowChart({
  data,
  selectedDate,
  onSelectDate,
}: {
  data: ChartItem[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}) {
  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    item: ChartItem;
  } | null>(null);

  const width = Math.max(860, data.length * 36 + 40);
  const height = 320;
  const chartTop = 16;
  const chartBottom = 268;
  const chartHeight = chartBottom - chartTop;
  const chartLeft = 22;
  const chartRight = width - 22;
  const chartWidth = chartRight - chartLeft;
  const xStep = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
  const maxBar = Math.max(1, ...data.map((item) => Math.max(item.entry, item.exit)));
  const minAcc = Math.min(...data.map((item) => item.accumulated), 0);
  const maxAcc = Math.max(...data.map((item) => item.accumulated), 1);
  const rangeAcc = Math.max(1, maxAcc - minAcc);

  const points = data.map((item, index) => {
    const x = chartLeft + index * xStep;
    const entryHeight = (item.entry / maxBar) * chartHeight;
    const exitHeight = (item.exit / maxBar) * chartHeight;
    const accY = chartBottom - ((item.accumulated - minAcc) / rangeAcc) * chartHeight;
    return {
      item,
      x,
      entryY: chartBottom - entryHeight,
      entryHeight,
      exitY: chartBottom - exitHeight,
      exitHeight,
      accY,
    };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.accY}`)
    .join(' ');

  return (
    <div className="relative overflow-x-auto rounded-lg border border-cyan-400/20 bg-slate-950/40 p-4">
      <svg width={width} height={height}>
        <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke="#334155" strokeWidth="1" />
        {points.map((point) => (
          <g key={point.item.date}>
            <rect
              x={point.x - 10}
              y={point.entryY}
              width={8}
              height={point.entryHeight}
              fill="#10b981"
              opacity={selectedDate && selectedDate !== point.item.date ? 0.35 : 0.95}
              className="cursor-pointer"
              onMouseEnter={(event) => setHovered({ x: event.clientX, y: event.clientY, item: point.item })}
              onMouseMove={(event) => setHovered({ x: event.clientX, y: event.clientY, item: point.item })}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectDate(selectedDate === point.item.date ? null : point.item.date)}
            />
            <rect
              x={point.x + 2}
              y={point.exitY}
              width={8}
              height={point.exitHeight}
              fill="#ef4444"
              opacity={selectedDate && selectedDate !== point.item.date ? 0.35 : 0.95}
              className="cursor-pointer"
              onMouseEnter={(event) => setHovered({ x: event.clientX, y: event.clientY, item: point.item })}
              onMouseMove={(event) => setHovered({ x: event.clientX, y: event.clientY, item: point.item })}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectDate(selectedDate === point.item.date ? null : point.item.date)}
            />
          </g>
        ))}
        <path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth={2.5} />
        {points.map((point) => (
          <circle
            key={`c-${point.item.date}`}
            cx={point.x}
            cy={point.accY}
            r={selectedDate === point.item.date ? 4.5 : 3}
            fill={selectedDate === point.item.date ? '#22d3ee' : '#0ea5e9'}
            className="cursor-pointer"
            onMouseEnter={(event) => setHovered({ x: event.clientX, y: event.clientY, item: point.item })}
            onMouseMove={(event) => setHovered({ x: event.clientX, y: event.clientY, item: point.item })}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelectDate(selectedDate === point.item.date ? null : point.item.date)}
          />
        ))}
        {points.map((point, index) =>
          index % Math.ceil(Math.max(1, data.length / 10)) === 0 ? (
            <text key={`t-${point.item.date}`} x={point.x - 12} y={chartBottom + 18} fill="#94a3b8" fontSize="10">
              {format(parseISO(point.item.date), 'dd/MM')}
            </text>
          ) : null
        )}
      </svg>
      {hovered ? (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-cyan-400/30 bg-[#0f172a] px-3 py-2 text-xs text-slate-100 shadow-xl"
          style={{ left: hovered.x + 12, top: hovered.y + 12 }}
        >
          <div className="font-semibold text-gray-300">{format(parseISO(hovered.item.date), 'dd/MM/yyyy')}</div>
          <div className="text-emerald-300">Entradas: {formatCurrency(hovered.item.entry)}</div>
          <div className="text-rose-300">Saídas: {formatCurrency(hovered.item.exit)}</div>
          <div className="text-yellow-300">Comissão projetada: {formatCurrency(hovered.item.commissionProjectedOut)}</div>
          <div className="text-cyan-200">Saldo acumulado: {formatCurrency(hovered.item.accumulated)}</div>
          <div className="text-slate-200">Saldo c/ comissão: {formatCurrency(hovered.item.accumulatedWithCommission)}</div>
        </div>
      ) : null}
    </div>
  );
}

export default function FluxoPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const defaults = useMemo(() => defaultDates(), []);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [hideReconciled, setHideReconciled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<CashFlowPayload | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/financial/cash-flow', {
        params: {
          period,
          from,
          to,
          accounts: accounts.join(','),
          categories: categories.join(','),
          hideReconciled: hideReconciled ? 1 : 0,
        },
      });
      setPayload((response.data?.data ?? null) as CashFlowPayload | null);
    } finally {
      setLoading(false);
    }
  }, [accounts, categories, from, hideReconciled, period, to]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visibleRows = useMemo(() => {
    if (!payload) return [];
    if (!selectedDate) return payload.rows;
    return payload.rows.filter((row) => format(parseISO(row.date), 'yyyy-MM-dd') === selectedDate);
  }, [payload, selectedDate]);

  const footerTotals = useMemo(() => {
    return visibleRows.reduce(
      (acc, row) => {
        if (row.direction === 'IN') acc.in += row.value;
        if (row.direction === 'OUT') acc.out += row.value;
        return acc;
      },
      { in: 0, out: 0 }
    );
  }, [visibleRows]);

  const toggleSelection = (value: string, selected: string[], setter: (next: string[]) => void) => {
    if (selected.includes(value)) setter(selected.filter((item) => item !== value));
    else setter([...selected, value]);
  };

  const exportExcel = () => {
    if (!visibleRows.length) return;
    const rows = visibleRows.map((row) => [
      format(parseISO(row.date), 'dd/MM/yyyy'),
      row.description,
      row.category,
      row.account,
      row.direction === 'IN' ? 'Entrada' : 'Saída',
      row.status,
      row.value.toFixed(2).replace('.', ','),
    ].join(';'));
    const content = ['Data;Descrição;Categoria;Conta/Banco;Tipo;Status;Valor', ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `fluxo_caixa_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!visibleRows.length) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Fluxo de Caixa - Virtual Games', 40, 36);
    doc.setFontSize(10);
    doc.text(`Período: ${from} até ${to}`, 40, 54);
    let y = 78;
    visibleRows.forEach((row) => {
      const line = `${format(parseISO(row.date), 'dd/MM/yyyy')} | ${row.description} | ${row.category} | ${row.direction === 'IN' ? '+' : '-'} ${formatCurrency(row.value)} | ${row.status}`;
      doc.text(line.slice(0, 118), 40, y);
      y += 14;
      if (y > 780) {
        doc.addPage();
        y = 40;
      }
    });
    doc.save(`fluxo_caixa_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
  };

  const reservePercent = useMemo(() => {
    if (!payload) return 0;
    const target = Math.max(payload.reserve.targetBalance, 1);
    return Math.min(100, Math.max(0, (payload.reserve.currentBalance / target) * 100));
  }, [payload]);

  const conciliationRate = useMemo(() => {
    if (!visibleRows.length) return 0;
    const conciliated = visibleRows.filter((row) => row.reconciled).length;
    return (conciliated / visibleRows.length) * 100;
  }, [visibleRows]);

  const commissionCalendar = useMemo(() => {
    if (!payload?.chart.length) {
      return { monthLabel: '', weekdays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], days: [] as Array<{ day: number; dateKey: string; commission: number; isInMonth: boolean }> };
    }
    const monthBase = parseISO(payload.period.start);
    const year = monthBase.getFullYear();
    const month = monthBase.getMonth();
    const startOfCalendar = new Date(year, month, 1);
    const endOfCalendar = new Date(year, month + 1, 0);
    const firstWeekday = startOfCalendar.getDay();
    const monthDays = endOfCalendar.getDate();
    const commissionByDate = new Map(payload.chart.map((item) => [item.date, item.commissionProjectedOut]));
    const days: Array<{ day: number; dateKey: string; commission: number; isInMonth: boolean }> = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      days.push({ day: 0, dateKey: `pad-start-${i}`, commission: 0, isInMonth: false });
    }

    for (let day = 1; day <= monthDays; day += 1) {
      const date = new Date(year, month, day);
      const dateKey = format(date, 'yyyy-MM-dd');
      days.push({
        day,
        dateKey,
        commission: Number((commissionByDate.get(dateKey) ?? 0).toFixed(2)),
        isInMonth: true,
      });
    }

    while (days.length % 7 !== 0) {
      days.push({ day: 0, dateKey: `pad-end-${days.length}`, commission: 0, isInMonth: false });
    }

    return {
      monthLabel: format(startOfCalendar, 'MMMM/yyyy'),
      weekdays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      days,
    };
  }, [payload]);

  return (
    <div className="space-y-6 text-slate-100">
      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-gray-300 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-300" />
            Fluxo de Caixa
          </CardTitle>
          <p className="text-slate-300 text-sm">Monitore entradas, saídas e a evolução do seu saldo em tempo real.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          <div className="xl:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <Select
              label="Período"
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="bg-slate-950/60 border-cyan-400/30"
            >
              <option value="today">Hoje</option>
              <option value="7d">7 dias</option>
              <option value="30d">30 dias</option>
              <option value="month">Mês Atual</option>
              <option value="custom">Personalizado</option>
            </Select>
            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              disabled={period !== 'custom'}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              disabled={period !== 'custom'}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Button
              variant="outline"
              className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10"
              onClick={() => void loadData()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
          <div className="xl:col-span-3 flex flex-wrap xl:justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10 w-full xl:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Relatório
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportPdf}>Exportar PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={exportExcel}>Exportar Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 rounded-lg border border-cyan-400/20 bg-slate-950/40 p-3">
            <div className="xl:col-span-4">
              <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">Conta/Banco</p>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {payload?.options.accounts.length ? payload.options.accounts.map((account) => (
                  <label key={account} className="flex items-center gap-2 text-sm text-slate-300">
                    <Checkbox
                      checked={accounts.includes(account)}
                      onCheckedChange={() => toggleSelection(account, accounts, setAccounts)}
                    />
                    <span>{account}</span>
                  </label>
                )) : <p className="text-xs text-slate-500">Sem opções</p>}
              </div>
            </div>
            <div className="xl:col-span-4">
              <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">Categoria</p>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {payload?.options.categories.length ? payload.options.categories.map((category) => (
                  <label key={category} className="flex items-center gap-2 text-sm text-slate-300">
                    <Checkbox
                      checked={categories.includes(category)}
                      onCheckedChange={() => toggleSelection(category, categories, setCategories)}
                    />
                    <span>{category}</span>
                  </label>
                )) : <p className="text-xs text-slate-500">Sem opções</p>}
              </div>
            </div>
            <div className="xl:col-span-4 flex flex-col justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <Checkbox checked={hideReconciled} onCheckedChange={(value) => setHideReconciled(Boolean(value))} />
                <span>Ocultar lançamentos conciliados</span>
              </label>
              <div className="flex md:justify-end">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-200 hover:bg-slate-800"
                  onClick={() => {
                    setAccounts([]);
                    setCategories([]);
                    setHideReconciled(false);
                    setSelectedDate(null);
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-md border-emerald-400/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-300">Total de Entradas</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-[#10b981]">
            {payload ? formatCurrency(payload.kpis.totalEntradas) : '--'}
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-rose-400/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-300">Total de Saídas</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-[#ef4444]">
            {payload ? formatCurrency(payload.kpis.totalSaidas) : '--'}
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-yellow-400/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-300">Comissão Projetada</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-yellow-300">
            {payload ? formatCurrency(payload.kpis.comissaoProjetadaPeriodo) : '--'}
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-cyan-400/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-300">Saldo Projetado c/ Comissão</CardTitle></CardHeader>
          <CardContent className={`text-3xl font-bold ${payload && payload.kpis.saldoProjetadoComComissao >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {payload ? formatCurrency(payload.kpis.saldoProjetadoComComissao) : '--'}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="bg-[#0f172a] border-cyan-400/20 xl:col-span-9">
          <CardHeader>
            <CardTitle className="text-gray-300">Visualização de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-sm text-slate-400">Carregando gráfico...</div>
            ) : payload && payload.chart.length ? (
              <CashFlowChart data={payload.chart} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            ) : (
              <div className="py-8 text-sm text-slate-400">Sem dados no período filtrado.</div>
            )}
          </CardContent>
        </Card>
        <div className="xl:col-span-3 space-y-4">
          <Card className="bg-[#0f172a] border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-gray-300 text-base">Calendário de Liquidação de Comissão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">{commissionCalendar.monthLabel || '--'}</p>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400">
                {commissionCalendar.weekdays.map((weekDay) => (
                  <span key={weekDay}>{weekDay}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {commissionCalendar.days.map((dayCell) => (
                  <div
                    key={dayCell.dateKey}
                    className={`min-h-11 rounded border px-1 py-1 text-[11px] ${
                      !dayCell.isInMonth
                        ? 'border-transparent bg-transparent'
                        : dayCell.commission > 0
                          ? 'border-yellow-400/50 bg-yellow-500/10 text-yellow-200'
                          : 'border-cyan-400/15 bg-slate-900/70 text-slate-400'
                    }`}
                  >
                    {dayCell.isInMonth ? (
                      <>
                        <div className="font-semibold">{dayCell.day}</div>
                        {dayCell.commission > 0 ? <div>{formatCurrency(dayCell.commission)}</div> : null}
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0f172a] border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-gray-300 text-base">Reserva de Emergência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-300">
                {payload ? `Cobertura de ${Math.max(0, payload.reserve.coverageMonths).toFixed(1)} meses de custos fixos` : '--'}
              </p>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-3 bg-[#0ea5e9]" style={{ width: `${reservePercent}%` }} />
              </div>
              <p className="text-xs text-slate-400">
                {payload ? `${formatCurrency(payload.reserve.currentBalance)} de ${formatCurrency(payload.reserve.targetBalance)} (meta)` : '--'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#0f172a] border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-gray-300 text-base">Conciliação no Filtro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Taxa conciliada</span>
                <span className="text-cyan-200 font-semibold">{conciliationRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-2 bg-cyan-400" style={{ width: `${conciliationRate}%` }} />
              </div>
              <p className="text-xs text-slate-500">{visibleRows.length} lançamentos visíveis</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-300">Lançamentos</CardTitle>
          {selectedDate ? (
            <Button
              variant="outline"
              className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10"
              onClick={() => setSelectedDate(null)}
            >
              <X className="w-4 h-4 mr-2" />
              Remover filtro do gráfico ({format(parseISO(selectedDate), 'dd/MM/yyyy')})
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
            <Table className="w-full min-w-[1080px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Data</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Descrição</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Conta/Banco</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Categoria</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Origem</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Valor</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Status</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Conciliação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400 border-b-0">Carregando lançamentos...</TableCell>
                  </TableRow>
                ) : visibleRows.length ? (
                  visibleRows.map((row) => (
                    <TableRow key={`${row.source}-${row.id}`} className="bg-slate-900/70 border-none hover:bg-slate-800/70">
                      <TableCell className="px-3 py-3 text-slate-200 border-b-0">{format(parseISO(row.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="px-3 py-3 text-slate-100 border-b-0">{row.description}</TableCell>
                      <TableCell className="px-3 py-3 text-slate-300 border-b-0">{row.account}</TableCell>
                      <TableCell className="px-3 py-3 border-b-0">
                        <Badge className={`border ${categoryBadgeColor(row.category)}`}>{row.category}</Badge>
                      </TableCell>
                      <TableCell className="px-3 py-3 border-b-0">
                        <Badge className={`border ${sourceBadge(row.source)}`}>
                          {row.origin === 'MANUAL'
                            ? 'Manual'
                            : row.origin === 'SALE'
                              ? 'Venda'
                              : row.origin === 'SERVICE'
                                ? 'Serviço'
                                : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`px-3 py-3 border-b-0 font-semibold ${row.direction === 'IN' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {row.direction === 'IN' ? '+' : '-'} {formatCurrency(row.value)}
                      </TableCell>
                      <TableCell className="px-3 py-3 border-b-0">
                        <Badge className={statusBadge(row.status)}>{row.status}</Badge>
                      </TableCell>
                      <TableCell className="px-3 py-3 border-b-0">
                        <Badge className={row.reconciled ? 'bg-cyan-500/15 text-gray-300 border border-cyan-400/40' : 'bg-slate-600/20 text-slate-300 border border-slate-500/40'}>
                          {row.reconciled ? 'Conciliado' : 'Aberto'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400 border-b-0">Nenhum lançamento encontrado.</TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-slate-800/70 border-none">
                  <TableCell className="px-3 py-3 font-semibold text-gray-300 border-b-0" colSpan={5}>Totais Visíveis</TableCell>
                  <TableCell className="px-3 py-3 border-b-0">
                    <div className="text-sm text-emerald-300">Entradas: {formatCurrency(footerTotals.in)}</div>
                    <div className="text-sm text-rose-300">Saídas: {formatCurrency(footerTotals.out)}</div>
                  </TableCell>
                  <TableCell className="px-3 py-3 border-b-0 text-slate-300">
                    Resultado: {formatCurrency(footerTotals.in - footerTotals.out)}
                  </TableCell>
                  <TableCell className="px-3 py-3 border-b-0 text-slate-400">
                    {conciliationRate.toFixed(1)}% conciliado
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
