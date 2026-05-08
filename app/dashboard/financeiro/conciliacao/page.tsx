'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Upload, Download, Link2, PlusCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

type StatementRow = {
  id: string;
  date: string;
  description: string;
  value: number;
};

type SystemRow = {
  id: string;
  date: string;
  origin: 'Venda' | 'Serviço' | 'Manual';
  customer: string;
  gross: number;
  feeValue: number;
  net: number;
};

type ReconciliationStatus = 'CONFIRMADO' | 'SUGESTAO' | 'PENDENTE' | 'DIVERGENTE';

type ReconciliationRow = {
  statement: StatementRow;
  matchedSystem: SystemRow | null;
  status: ReconciliationStatus;
  dayDiff: number | null;
};

const normalizeValue = (value: number) => Number(value.toFixed(2));

const daysBetween = (dateA: string, dateB: string) => {
  const first = new Date(dateA);
  const second = new Date(dateB);
  const utcA = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate());
  const utcB = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate());
  return Math.abs(Math.round((utcA - utcB) / (1000 * 60 * 60 * 24)));
};

const parseDateFlexible = (raw: string) => {
  const value = raw.trim();
  if (!value) return new Date().toISOString();
  if (/^\d{8}$/.test(value)) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    return new Date(`${year}-${month}-${day}T12:00:00`).toISOString();
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    return new Date(`${year}-${month}-${day}T12:00:00`).toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`).toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const parseNumberFlexible = (raw: string) => {
  const sanitized = raw.replace(/[^\d,.-]/g, '').trim();
  if (!sanitized) return 0;
  const hasComma = sanitized.includes(',');
  const normalized = hasComma ? sanitized.replace(/\./g, '').replace(',', '.') : sanitized;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
};

const parseCsvRows = (content: string): StatementRow[] => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return [];
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const header = lines[0].toLowerCase().split(delimiter).map((field) => field.trim());
  const dateIndex = header.findIndex((field) => ['data', 'date', 'dt'].includes(field));
  const descriptionIndex = header.findIndex((field) => ['descricao', 'descrição', 'description', 'historico', 'histórico', 'memo'].includes(field));
  const valueIndex = header.findIndex((field) => ['valor', 'value', 'amount', 'val'].includes(field));
  const dataLines = lines.slice(1);

  return dataLines
    .map((line, index) => {
      const cols = line.split(delimiter).map((item) => item.trim());
      const dateRaw = cols[dateIndex >= 0 ? dateIndex : 0] ?? '';
      const descriptionRaw = cols[descriptionIndex >= 0 ? descriptionIndex : 1] ?? 'Transação bancária';
      const valueRaw = cols[valueIndex >= 0 ? valueIndex : 2] ?? '0';
      return {
        id: `csv-${index + 1}-${Date.now()}`,
        date: parseDateFlexible(dateRaw),
        description: descriptionRaw || 'Transação bancária',
        value: parseNumberFlexible(valueRaw),
      };
    })
    .filter((item) => item.value !== 0);
};

const extractTagValue = (block: string, tag: string) => {
  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = new RegExp(`<${tag}>([^\\r\\n<]+)`, 'i');
  const match = block.match(regex);
  return match?.[1]?.trim() ?? '';
};

const parseOfxRows = (content: string): StatementRow[] => {
  const blocks = content.split(/<STMTTRN>/i).slice(1);
  return blocks
    .map((block, index) => {
      const dateRaw = extractTagValue(block, 'DTPOSTED').slice(0, 8);
      const valueRaw = extractTagValue(block, 'TRNAMT');
      const memoRaw = extractTagValue(block, 'MEMO') || extractTagValue(block, 'NAME');
      return {
        id: `ofx-${index + 1}-${Date.now()}`,
        date: parseDateFlexible(dateRaw),
        description: memoRaw || 'Lançamento OFX',
        value: parseNumberFlexible(valueRaw),
      };
    })
    .filter((item) => item.value !== 0);
};

const parseBankFile = (content: string): StatementRow[] => {
  const trimmed = content.trim();
  if (!trimmed) return [];
  if (/<OFX|<STMTTRN>/i.test(trimmed)) return parseOfxRows(trimmed);
  return parseCsvRows(trimmed);
};

const statusLabel: Record<ReconciliationStatus, string> = {
  CONFIRMADO: 'Confirmado',
  SUGESTAO: 'Sugestão',
  PENDENTE: 'Pendente',
  DIVERGENTE: 'Divergente',
};

const statusClassName: Record<ReconciliationStatus, string> = {
  CONFIRMADO: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
  SUGESTAO: 'bg-yellow-500/15 text-yellow-300 border-yellow-400/40',
  PENDENTE: 'bg-red-500/15 text-red-300 border-red-400/40',
  DIVERGENTE: 'bg-red-500/15 text-red-300 border-red-400/40',
};

export default function ConciliacaoPage() {
  const [statementRows, setStatementRows] = useState<StatementRow[]>([]);
  const [systemRows, setSystemRows] = useState<SystemRow[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [manualLinks, setManualLinks] = useState<Record<string, string>>({});
  const [hoveredStatementId, setHoveredStatementId] = useState<string | null>(null);
  const [hoveredSystemId, setHoveredSystemId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemRows = async () => {
      const response = await api.get('/financial/receivables', {
        params: {
          status: 'PAID',
          limit: 200,
        },
      });
      const data = (response.data?.data?.data ?? []) as Array<{
        id: string;
        origin: 'MANUAL' | 'SALE' | 'SERVICE';
        customer: { name: string } | null;
        value: number;
        cardFeePercent: number | null;
        cardFeeValue: number | null;
        netValue: number | null;
        paidAt: string | null;
        paymentMethod: string | null;
      }>;
      const cardRows = data.filter((row) => ['PIX', 'CARTAO', 'CREDITO', 'DEBITO'].includes(String(row.paymentMethod ?? '')));
      setSystemRows(
        cardRows.map((row) => ({
          id: row.id,
          date: row.paidAt ? String(row.paidAt) : new Date().toISOString(),
          origin: row.origin === 'SALE' ? 'Venda' : row.origin === 'SERVICE' ? 'Serviço' : 'Manual',
          customer: row.customer?.name ?? 'Consumidor final',
          gross: Number(row.value),
          feeValue: Number(row.cardFeeValue ?? 0),
          net: Number(row.netValue ?? row.value),
        }))
      );
    };
    const timer = setTimeout(() => {
      void fetchSystemRows();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleImport = async (file?: File) => {
    if (!file) return;
    const content = await file.text();
    const importedRows = parseBankFile(content);
    setStatementRows(importedRows);
    setManualLinks({});
  };

  const handleAutoConciliation = () => {
    const reconciledMap: Record<string, string> = {};
    const usedSystemIds = new Set<string>();

    statementRows.forEach((statement) => {
      const candidates = systemRows
        .filter((system) => !usedSystemIds.has(system.id) && normalizeValue(system.net) === normalizeValue(statement.value))
        .map((system) => ({ system, dayDiff: daysBetween(system.date, statement.date) }))
        .sort((a, b) => a.dayDiff - b.dayDiff);

      if (candidates.length === 0) return;
      const best = candidates[0];
      if (best.dayDiff <= 3) {
        reconciledMap[statement.id] = best.system.id;
        usedSystemIds.add(best.system.id);
      }
    });

    setManualLinks((current) => ({ ...current, ...reconciledMap }));
  };

  const runReconciliation = useMemo(() => {
    const rows: ReconciliationRow[] = [];
    const usedSystemIds = new Set<string>();

    statementRows.forEach((statement) => {
      const manualSystemId = manualLinks[statement.id];
      if (manualSystemId) {
        const manualMatch = systemRows.find((item) => item.id === manualSystemId) ?? null;
        if (manualMatch) usedSystemIds.add(manualMatch.id);
        rows.push({
          statement,
          matchedSystem: manualMatch,
          status: manualMatch ? 'CONFIRMADO' : 'PENDENTE',
          dayDiff: manualMatch ? daysBetween(statement.date, manualMatch.date) : null,
        });
        return;
      }

      const exactValueCandidates = systemRows
        .filter((system) => !usedSystemIds.has(system.id) && normalizeValue(system.net) === normalizeValue(statement.value))
        .map((system) => ({ system, dayDiff: daysBetween(system.date, statement.date) }))
        .sort((a, b) => a.dayDiff - b.dayDiff);

      if (exactValueCandidates.length > 0) {
        const best = exactValueCandidates[0];
        if (best.dayDiff === 0) {
          usedSystemIds.add(best.system.id);
          rows.push({ statement, matchedSystem: best.system, status: 'CONFIRMADO', dayDiff: best.dayDiff });
          return;
        }
        if (best.dayDiff <= 3) {
          usedSystemIds.add(best.system.id);
          rows.push({ statement, matchedSystem: best.system, status: 'SUGESTAO', dayDiff: best.dayDiff });
          return;
        }
      }

      const byDateCandidates = systemRows
        .filter((system) => !usedSystemIds.has(system.id))
        .map((system) => ({
          system,
          dayDiff: daysBetween(system.date, statement.date),
          valueGap: Math.abs(normalizeValue(system.net) - normalizeValue(statement.value)),
        }))
        .filter((item) => item.dayDiff <= 3)
        .sort((a, b) => a.valueGap - b.valueGap);

      if (byDateCandidates.length > 0) {
        rows.push({
          statement,
          matchedSystem: byDateCandidates[0].system,
          status: 'DIVERGENTE',
          dayDiff: byDateCandidates[0].dayDiff,
        });
        return;
      }

      rows.push({
        statement,
        matchedSystem: null,
        status: 'PENDENTE',
        dayDiff: null,
      });
    });

    return rows;
  }, [manualLinks, statementRows, systemRows]);

  const availableSystemRows = useMemo(() => {
    const linkedSystemIds = new Set(Object.values(manualLinks));
    return systemRows.filter((row) => !linkedSystemIds.has(row.id));
  }, [manualLinks, systemRows]);

  const linkManually = (statementId: string) => {
    const currentRow = runReconciliation.find((item) => item.statement.id === statementId);
    if (!currentRow) return;
    const selected = availableSystemRows
      .map((item) => ({
        row: item,
        valueGap: Math.abs(normalizeValue(item.net) - normalizeValue(currentRow.statement.value)),
        dayDiff: daysBetween(item.date, currentRow.statement.date),
      }))
      .sort((a, b) => a.valueGap - b.valueGap || a.dayDiff - b.dayDiff)[0];
    if (!selected) return;
    setManualLinks((current) => ({ ...current, [statementId]: selected.row.id }));
  };

  const launchNow = (statementId: string) => {
    const sourceRow = statementRows.find((item) => item.id === statementId);
    if (!sourceRow) return;
    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fastEntry: SystemRow = {
      id,
      date: sourceRow.date,
      origin: 'Serviço',
      customer: 'Lançamento rápido',
      gross: Math.abs(sourceRow.value),
      feeValue: 0,
      net: Math.abs(sourceRow.value),
    };
    setSystemRows((current) => [fastEntry, ...current]);
    setManualLinks((current) => ({ ...current, [statementId]: id }));
  };

  const handleExportConciliation = () => {
    if (runReconciliation.length === 0) return;
    const header = 'id;data_extrato;descricao_extrato;valor_extrato;id_sistema;data_sistema;valor_sistema;status';
    const body = runReconciliation.map((row) =>
      [
        row.statement.id,
        new Date(row.statement.date).toISOString().slice(0, 10),
        row.statement.description,
        row.statement.value.toFixed(2),
        row.matchedSystem?.id ?? '',
        row.matchedSystem ? new Date(row.matchedSystem.date).toISOString().slice(0, 10) : '',
        row.matchedSystem ? row.matchedSystem.net.toFixed(2) : '',
        statusLabel[row.status].toUpperCase(),
      ].join(';')
    );
    const blob = new Blob([`${header}\n${body.join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'conciliacao_financeira.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const grossTotal = useMemo(
    () => systemRows.reduce((acc, item) => acc + item.gross, 0),
    [systemRows]
  );
  const feeTotal = useMemo(
    () => systemRows.reduce((acc, item) => acc + item.feeValue, 0),
    [systemRows]
  );
  const netTotal = useMemo(
    () => systemRows.reduce((acc, item) => acc + item.net, 0),
    [systemRows]
  );
  const statementTotal = useMemo(
    () => statementRows.reduce((acc, item) => acc + item.value, 0),
    [statementRows]
  );
  const detectedDifference = useMemo(
    () => normalizeValue(statementTotal - netTotal),
    [statementTotal, netTotal]
  );
  const isBalanced = Math.abs(detectedDifference) < 0.01;

  return (
    <div className="space-y-6 text-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-md border-cyan-400/20 shadow-[0_0_40px_rgba(6,182,212,0.08)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Bruto Esperado</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-gray-300">{formatCurrency(grossTotal)}</CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-cyan-400/20 shadow-[0_0_40px_rgba(6,182,212,0.08)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Taxas (Estimado)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-rose-300">{formatCurrency(feeTotal)}</CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-emerald-400/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Líquido a Receber</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-300">{formatCurrency(netTotal)}</CardContent>
        </Card>
        <Card className={`bg-white/5 backdrop-blur-md ${isBalanced ? 'border-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-red-400/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Diferença Detectada</CardTitle>
          </CardHeader>
          <CardContent className={`text-xl font-bold ${isBalanced ? 'text-emerald-300' : 'text-red-300'}`}>
            {formatCurrency(detectedDifference)}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-300">
            <ShieldCheck className="w-5 h-5 text-gray-300" />
            Conferir extrato
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-cyan-400 text-slate-900 font-semibold cursor-pointer transition hover:bg-cyan-300">
              <Upload className="w-4 h-4" />
              Importar Arquivo OFX/CSV
              <input
                type="file"
                accept=".csv,.ofx,text/csv,text/plain"
                className="hidden"
                onChange={(event) => handleImport(event.target.files?.[0])}
              />
            </label>
            <Button
              variant="outline"
              className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              onClick={handleAutoConciliation}
              disabled={statementRows.length === 0}
            >
              Conciliar automático
            </Button>
            <Button
              variant="outline"
              className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              onClick={handleExportConciliation}
              disabled={statementRows.length === 0}
            >
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`rounded-lg border border-dashed transition ${
              isDraggingFile ? 'border-cyan-300 bg-cyan-400/10' : 'border-cyan-400/30 bg-slate-900/40'
            } p-4 text-center text-sm text-slate-300`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDraggingFile(false);
              const file = event.dataTransfer.files?.[0];
              void handleImport(file);
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-gray-300" />
              Arraste o arquivo OFX/CSV aqui para importar o extrato bancário
            </div>
          </div>

          <div className="max-h-[560px] overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40 px-2">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-2 py-2">Extrato</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-2 py-2">Sistema</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-2 py-2">Conferência</th>
                </tr>
              </thead>
              <tbody>
                {runReconciliation.length === 0 ? (
                  <tr>
                    <td className="px-2 py-8 text-sm text-slate-400" colSpan={3}>
                      Importe um arquivo para iniciar a conferência tripla.
                    </td>
                  </tr>
                ) : (
                  runReconciliation.map((row) => {
                    const isStatementHovered = hoveredStatementId === row.statement.id;
                    const isSystemHovered = Boolean(row.matchedSystem && hoveredSystemId === row.matchedSystem.id);
                    return (
                      <tr
                        key={row.statement.id}
                        onMouseEnter={() => {
                          setHoveredStatementId(row.statement.id);
                          setHoveredSystemId(row.matchedSystem?.id ?? null);
                        }}
                        onMouseLeave={() => {
                          setHoveredStatementId(null);
                          setHoveredSystemId(null);
                        }}
                      >
                        <td className="align-top px-2">
                          <div className={`rounded-lg border p-3 ${isStatementHovered ? 'border-cyan-300/70 bg-cyan-500/10' : 'border-slate-700/70 bg-slate-900/70'}`}>
                            <div className="text-xs text-slate-400">{new Date(row.statement.date).toLocaleDateString('pt-BR')}</div>
                            <div className="text-sm font-medium text-slate-100">{row.statement.description}</div>
                            <div className="text-sm text-cyan-200">{formatCurrency(row.statement.value)}</div>
                          </div>
                        </td>

                        <td className="align-top px-2">
                          {row.matchedSystem ? (
                            <div className={`rounded-lg border p-3 transition ${isSystemHovered ? 'border-cyan-300/70 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-slate-700/70 bg-slate-900/70'}`}>
                              <div className="text-xs text-slate-400">{new Date(row.matchedSystem.date).toLocaleDateString('pt-BR')}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant={row.matchedSystem.origin === 'Venda' ? 'success' : row.matchedSystem.origin === 'Serviço' ? 'warning' : 'default'}>{row.matchedSystem.origin}</Badge>
                                <span className="text-sm text-slate-200">{row.matchedSystem.customer}</span>
                              </div>
                              <div className="text-xs text-slate-400">Bruto {formatCurrency(row.matchedSystem.gross)} • Taxa {formatCurrency(row.matchedSystem.feeValue)}</div>
                              <div className="text-sm font-semibold text-emerald-300">{formatCurrency(row.matchedSystem.net)}</div>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-3 text-sm text-slate-400">
                              Sem lançamento vinculado no sistema.
                            </div>
                          )}
                        </td>

                        <td className="align-top px-2">
                          <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-3 space-y-3">
                            <Badge className={statusClassName[row.status]} variant="outline">
                              {statusLabel[row.status]}
                            </Badge>
                            {row.dayDiff !== null ? (
                              <div className="text-xs text-slate-400">Diferença de data: {row.dayDiff} dia(s)</div>
                            ) : null}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
                                onClick={() => linkManually(row.statement.id)}
                                disabled={row.status === 'CONFIRMADO'}
                              >
                                <Link2 className="w-4 h-4 mr-1" />
                                Vincular Manualmente
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-400/40 text-emerald-200 hover:bg-emerald-400/10"
                                onClick={() => launchNow(row.statement.id)}
                              >
                                <PlusCircle className="w-4 h-4 mr-1" />
                                Lançar Agora
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
