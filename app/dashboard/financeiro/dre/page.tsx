'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/native-select';
import { BarChart3, Printer, FileDown, FileSpreadsheet, ChevronDown, ChevronRight } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

type DreLine = {
  key: string;
  label: string;
  value: number;
  percentOfNetRevenue: number;
  isSubtotal: boolean;
  details: Array<{
    label: string;
    value: number;
  }>;
};

type DrePayload = {
  period: {
    month: number;
    year: number;
    monthLabel: string;
  };
  summary: {
    margemBruta: number;
    margemLiquida: number;
    pontoEquilibrio: number;
    receitaLiquidaServicos: number;
  };
  lines: DreLine[];
};

const monthOptions = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
] as const;

export default function DREPage() {
  const currentDate = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<DrePayload | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const yearOptions = useMemo(() => {
    const startYear = currentDate.getFullYear() - 4;
    return Array.from({ length: 8 }, (_, index) => startYear + index);
  }, [currentDate]);

  const loadDre = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/financial/dre', { params: { month, year } });
      setPayload((response.data?.data ?? null) as DrePayload | null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void loadDre();
  }, [loadDre]);

  const toggleExpand = (key: string) => {
    // eslint-disable-next-line security/detect-object-injection
    setExpandedRows((current) => ({ ...current, [key]: !current[key] }));
  };

  const exportExcel = () => {
    if (!payload || payload.lines.length === 0) return;
    const rows = payload.lines.flatMap((line) => {
      const summary = [
        line.label,
        line.value.toFixed(2),
        line.percentOfNetRevenue.toFixed(2),
      ].join(';');
      const details = line.details.map((detail) =>
        [`  - ${detail.label}`, detail.value.toFixed(2), ''].join(';')
      );
      return [summary, ...details];
    });
    const content = ['Descrição;Valor (R$);% sobre Receita Líquida', ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dre_${year}_${String(month).padStart(2, '0')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!payload || payload.lines.length === 0) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text(`DRE Gerencial - ${payload.period.monthLabel}/${payload.period.year}`, 40, 40);
    doc.setFontSize(10);
    let y = 70;
    for (const line of payload.lines) {
      const text = `${line.label} | ${formatCurrency(line.value)} | ${formatPercent(line.percentOfNetRevenue)}`;
      doc.text(text.slice(0, 105), 40, y);
      y += 16;
      if (y > 760) {
        doc.addPage();
        y = 40;
      }
    }
    doc.save(`dre_${year}_${String(month).padStart(2, '0')}.pdf`);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-300">
            <BarChart3 className="w-5 h-5 text-neon-blue" />
            Resultado do mês
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-[200px_160px_1fr] gap-3 items-end">
          <Select
            label="Mês"
            value={String(month)}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="bg-black/20 border-[rgba(255,255,255,0.1)]"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <Select
            label="Ano"
            value={String(year)}
            onChange={(event) => setYear(Number(event.target.value))}
            className="bg-black/20 border-[rgba(255,255,255,0.1)]"
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button variant="neon" onClick={() => void loadDre()}>
              Atualizar DRE
            </Button>
            <Button variant="outline" onClick={exportPdf}>
              <FileDown className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={exportExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
            <Button variant="outline" onClick={printReport}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-400">Margem Bruta (%)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-300">
            {payload ? formatPercent(payload.summary.margemBruta) : '--'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-400">Margem Líquida (%)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-300">
            {payload ? formatPercent(payload.summary.margemLiquida) : '--'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-400">Ponto de Equilíbrio (R$)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-neon-blue">
            {payload ? formatCurrency(payload.summary.pontoEquilibrio) : '--'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-400">Receita Líquida de Serviços</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-yellow-300">
            {payload ? formatCurrency(payload.summary.receitaLiquidaServicos) : '--'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Tabela DRE por Regime de Competência
            {payload ? ` — ${payload.period.monthLabel}/${payload.period.year}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg">
            <table className="w-full min-w-[900px] border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Descrição</th>
                  <th className="text-right text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Valor (R$)</th>
                  <th className="text-right text-xs uppercase tracking-wide text-gray-400 px-3 py-3">% sobre Receita Líquida</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center text-sm text-gray-400 py-8">Carregando DRE...</td>
                  </tr>
                ) : payload && payload.lines.length > 0 ? (
                  payload.lines.map((line) => {
                    const expanded = Boolean(expandedRows[line.key]);
                    const expandable = line.details.length > 0;
                    return [
                      <tr key={`${line.key}-main`} className={line.isSubtotal ? 'bg-slate-800/70' : 'bg-slate-900/70'}>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              className={`w-full flex items-center gap-2 text-left ${line.isSubtotal ? 'font-semibold text-slate-100' : 'text-slate-200'} ${expandable ? 'cursor-pointer' : 'cursor-default'}`}
                              onClick={() => expandable && toggleExpand(line.key)}
                            >
                              {expandable ? (expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />) : <span className="w-4 h-4" />}
                              {line.label}
                            </button>
                          </td>
                          <td className={`px-3 py-3 text-right font-semibold ${line.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(line.value)}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-300">
                            {formatPercent(line.percentOfNetRevenue)}
                          </td>
                      </tr>,
                      ...(expanded && expandable
                        ? line.details.map((detail) => (
                          <tr key={`${line.key}-${detail.label}`} className="bg-slate-950/80">
                            <td className="px-10 py-2 text-sm text-gray-400">{detail.label}</td>
                            <td className="px-3 py-2 text-right text-sm text-rose-300">
                              {formatCurrency(-Math.abs(detail.value))}
                            </td>
                            <td className="px-3 py-2 text-right text-sm text-gray-500">-</td>
                          </tr>
                        ))
                        : []),
                    ];
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-sm text-slate-400 py-8">
                      Sem dados para o período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
