'use client';

/* eslint-disable security/detect-object-injection */

import { useCallback, useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { ArrowDownAZ, ArrowUpAZ, Download, FileDown, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/native-select';

type ReportType =
  | 'product_profitability'
  | 'customer_profitability'
  | 'cash_flow_projected_realized'
  | 'abc_sales_margin'
  | 'stock_turnover_coverage'
  | 'dead_stock_opportunity'
  | 'sales_channel_payment'
  | 'commissions_performance'
  | 'os_sla'
  | 'rework_warranty_returns'
  | 'satisfaction_correlation'
  | 'cohort_clients'
  | 'funnel_effectiveness'
  | 'commission_by_technician'
  | 'revenue_by_origin'
  | 'service_financial_impact';

type ReportKpi = { label: string; value: string };
type ReportColumn = { key: string; label: string };
type ReportRow = Record<string, string | number>;

type ReportPayload = {
  title: string;
  reportType: ReportType;
  period: { from: string; to: string };
  kpis: ReportKpi[];
  columns: ReportColumn[];
  rows: ReportRow[];
};

type SortDirection = 'asc' | 'desc';

const REPORT_OPTIONS: Array<{ value: ReportType; label: string }> = [
  { value: 'product_profitability', label: '1) Rentabilidade por Produto' },
  { value: 'customer_profitability', label: '2) Rentabilidade por Cliente' },
  { value: 'cash_flow_projected_realized', label: '3) Fluxo de Caixa Projetado x Realizado' },
  { value: 'abc_sales_margin', label: '4) Curva ABC de Vendas e Margem' },
  { value: 'stock_turnover_coverage', label: '5) Giro e Cobertura de Estoque' },
  { value: 'dead_stock_opportunity', label: '6) Estoque Parado e Oportunidade' },
  { value: 'sales_channel_payment', label: '7) Vendas por Canal e Pagamento' },
  { value: 'commissions_performance', label: '8) Comissões e Performance' },
  { value: 'os_sla', label: '9) SLA de Ordens de Serviço' },
  { value: 'rework_warranty_returns', label: '10) Retrabalho, Garantia e Devoluções' },
  { value: 'satisfaction_correlation', label: '11) Satisfação com Correlação' },
  { value: 'cohort_clients', label: '12) Cohort de Clientes' },
  { value: 'funnel_effectiveness', label: '13) Efetividade do Funil' },
  { value: 'commission_by_technician', label: '14) Comissão por Técnico (Mensal)' },
  { value: 'revenue_by_origin', label: '15) Receita por Origem' },
  { value: 'service_financial_impact', label: '16) Serviços com Impacto Financeiro' },
];

const REPORT_EXPLANATIONS: Record<
  ReportType,
  {
    descricao: string;
    decisoes: string;
    exemplosAcao: string[];
  }
> = {
  product_profitability: {
    descricao: 'Mostra margem real por produto com base em receita e custo.',
    decisoes: 'Apoia decisões de preço, mix de venda e reposição de itens com maior retorno.',
    exemplosAcao: [
      'Aumentar exposição dos itens com maior margem percentual.',
      'Revisar preço dos itens com margem baixa e alto volume.',
      'Reduzir compra de itens com margem negativa no período.',
    ],
  },
  customer_profitability: {
    descricao: 'Apresenta retorno financeiro por cliente considerando receita, custo e margem.',
    decisoes: 'Apoia decisões de retenção, relacionamento e ofertas por perfil de cliente.',
    exemplosAcao: [
      'Criar campanha de recompra para clientes com alta margem.',
      'Revisar condições comerciais de clientes com margem baixa.',
      'Priorizar atendimento ativo dos clientes com maior valor acumulado.',
    ],
  },
  cash_flow_projected_realized: {
    descricao: 'Compara entradas e saídas projetadas com os valores realizados no período.',
    decisoes: 'Apoia decisões de caixa, pagamento de contas e planejamento de capital de giro.',
    exemplosAcao: [
      'Antecipar cobrança quando o desvio diário ficar negativo.',
      'Postergar despesa não crítica em semanas de saldo pressionado.',
      'Ajustar metas de recebimento com base no desvio recorrente.',
    ],
  },
  abc_sales_margin: {
    descricao: 'Classifica produtos em curva ABC por participação de faturamento e margem.',
    decisoes: 'Apoia decisões de compra, estoque e prioridade de exposição no ponto de venda.',
    exemplosAcao: [
      'Garantir estoque dos itens classe A.',
      'Reavaliar esforço comercial dos itens classe C.',
      'Montar combos com itens B e C para acelerar giro.',
    ],
  },
  stock_turnover_coverage: {
    descricao: 'Mede giro e cobertura de estoque por produto com base nas vendas do período.',
    decisoes: 'Apoia decisões de reposição e prevenção de ruptura ou excesso de estoque.',
    exemplosAcao: [
      'Recomprar itens com baixa cobertura e alta saída.',
      'Segurar novas compras em itens com cobertura muito alta.',
      'Ajustar estoque mínimo por categoria conforme histórico real.',
    ],
  },
  dead_stock_opportunity: {
    descricao: 'Mostra itens sem giro e valor imobilizado em estoque.',
    decisoes: 'Apoia decisões de liquidação, promoção e recuperação de caixa.',
    exemplosAcao: [
      'Criar campanha para itens com criticidade alta.',
      'Aplicar desconto progressivo conforme dias sem giro.',
      'Substituir itens parados por produtos de maior saída.',
    ],
  },
  sales_channel_payment: {
    descricao: 'Compara desempenho de vendas por canal e meio de pagamento.',
    decisoes: 'Apoia decisões de política comercial, taxas e direcionamento de canais.',
    exemplosAcao: [
      'Incentivar meios com maior líquido percentual.',
      'Negociar taxa quando o impacto financeiro estiver alto.',
      'Reforçar canal com maior faturamento líquido.',
    ],
  },
  commissions_performance: {
    descricao: 'Consolida resultado por colaborador com receita líquida, margem e comissão.',
    decisoes: 'Apoia decisões de meta, comissão e acompanhamento de performance.',
    exemplosAcao: [
      'Ajustar meta individual com base no histórico real.',
      'Premiar desempenho consistente em margem gerada.',
      'Treinar time com baixa conversão e baixa margem.',
    ],
  },
  os_sla: {
    descricao: 'Mede tempo de ciclo de ordens de serviço por status e técnico.',
    decisoes: 'Apoia decisões de alocação de equipe e redução de atraso na entrega.',
    exemplosAcao: [
      'Redistribuir OS quando lead time médio estiver elevado.',
      'Priorizar OS antigas para reduzir fila.',
      'Atuar na etapa com maior permanência para remover gargalo.',
    ],
  },
  rework_warranty_returns: {
    descricao: 'Consolida ocorrências de retrabalho, garantia e devolução com custo estimado.',
    decisoes: 'Apoia decisões de qualidade, processo e controle de perda operacional.',
    exemplosAcao: [
      'Tratar causa raiz dos motivos mais frequentes.',
      'Revisar fornecedor ou produto com alta incidência de retorno.',
      'Criar checklist técnico para reduzir recorrência de retrabalho.',
    ],
  },
  satisfaction_correlation: {
    descricao: 'Relaciona nota de satisfação com impacto financeiro por cliente e tipo.',
    decisoes: 'Apoia decisões de atendimento, pós-venda e ações de fidelização.',
    exemplosAcao: [
      'Priorizar contato com clientes de baixa nota.',
      'Padronizar práticas das equipes com melhores notas.',
      'Executar ação de recuperação para clientes críticos.',
    ],
  },
  cohort_clients: {
    descricao: 'Mostra retenção por cohorte de aquisição ao longo dos meses.',
    decisoes: 'Apoia decisões de retenção e avaliação de qualidade da base ativa.',
    exemplosAcao: [
      'Fortalecer ações no primeiro mês para elevar retenção.',
      'Comparar cohorts para identificar períodos mais fortes.',
      'Criar jornada de recompra para cohorts com queda acelerada.',
    ],
  },
  funnel_effectiveness: {
    descricao: 'Exibe distribuição do funil e taxa de conversão por etapa.',
    decisoes: 'Apoia decisões comerciais para remover travas na conversão.',
    exemplosAcao: [
      'Atuar na etapa com maior volume parado.',
      'Definir rotina de follow-up para etapas críticas.',
      'Ajustar argumento comercial conforme estágio de perda.',
    ],
  },
  commission_by_technician: {
    descricao: 'Detalha comissão por técnico com OS, serviço, base e valor de comissão.',
    decisoes: 'Apoia fechamento mensal de comissões com rastreabilidade de provisão e pagamento.',
    exemplosAcao: [
      'Conferir pendências por técnico antes do fechamento.',
      'Validar divergência de comissão por OS.',
      'Executar pagamento por competência com base no relatório.',
    ],
  },
  revenue_by_origin: {
    descricao: 'Consolida entradas por origem: manual, venda de produto e serviço pago.',
    decisoes: 'Apoia análise da composição real do caixa e do impacto de comissões.',
    exemplosAcao: [
      'Comparar participação de serviço e produto no período.',
      'Acompanhar peso da comissão sobre receitas de serviço.',
      'Validar volume de lançamentos manuais por competência.',
    ],
  },
  service_financial_impact: {
    descricao: 'Mostra impacto financeiro por serviço e técnico após comissão.',
    decisoes: 'Apoia priorização de serviços com maior líquido e ajuste de operação técnica.',
    exemplosAcao: [
      'Priorizar serviços com maior líquido por execução.',
      'Acompanhar equilíbrio de resultado por técnico.',
      'Revisar serviços com líquido baixo recorrente.',
    ],
  },
};

const defaultPeriod = () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
};

const formatCell = (value: string | number) => {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString('pt-BR');
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value;
};

const financialTokens = ['valor', 'receita', 'margem', 'custo', 'faturamento', 'comissao', 'liquido', 'taxa', 'ticket', 'desvio'];

const isFinancialColumn = (column: ReportColumn) => {
  const source = `${column.key} ${column.label}`.toLowerCase();
  return financialTokens.some((token) => source.includes(token));
};

const normalizeCsvCell = (value: string | number) => {
  if (typeof value === 'number') return value.toString().replace('.', ',');
  return value.replaceAll(';', ',');
};

const getSortableValue = (value: string | number | undefined) => {
  if (value === undefined) return '';
  if (typeof value === 'number') return value;
  return value.toString().toLowerCase();
};

export default function RelatoriosGerenciaisPage() {
  const period = useMemo(() => defaultPeriod(), []);
  const [reportType, setReportType] = useState<ReportType>('product_profitability');
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<ReportPayload | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/management', {
        params: { reportType, from, to },
      });
      const data = response.data?.data as ReportPayload;
      setPayload(data);
    } finally {
      setLoading(false);
    }
  }, [reportType, from, to]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!payload || payload.columns.length === 0) {
      setSortBy(null);
      setSortDirection('desc');
      return;
    }
    const preferred = payload.columns.find((column) =>
      ['valorComissao', 'receitaLiquidaServico', 'valorLiquido', 'margem', 'receita', 'faturamentoBruto'].includes(column.key)
    );
    setSortBy(preferred?.key ?? payload.columns[0].key);
    setSortDirection('desc');
  }, [payload]);

  const explanation = REPORT_EXPLANATIONS[reportType];

  const sortedRows = useMemo(() => {
    if (!payload) return [];
    if (!sortBy) return payload.rows;
    return [...payload.rows].sort((a, b) => {
      const valueA = getSortableValue(a[sortBy] as string | number | undefined);
      const valueB = getSortableValue(b[sortBy] as string | number | undefined);
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      const textA = String(valueA);
      const textB = String(valueB);
      return sortDirection === 'asc' ? textA.localeCompare(textB) : textB.localeCompare(textA);
    });
  }, [payload, sortBy, sortDirection]);

  const toggleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(columnKey);
    setSortDirection('desc');
  };

  const exportCsv = () => {
    if (!payload || sortedRows.length === 0) return;
    const header = payload.columns.map((column) => column.label).join(';');
    const body = sortedRows.map((row) =>
      payload.columns.map((column) => normalizeCsvCell(row[column.key] ?? '-')).join(';')
    );
    const blob = new Blob([[header, ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${payload.reportType}_${payload.period.from}_${payload.period.to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!payload || sortedRows.length === 0) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(13);
    doc.text(payload.title, 36, 36);
    doc.setFontSize(9);
    doc.text(`Período: ${payload.period.from} até ${payload.period.to}`, 36, 54);
    let y = 78;
    const lines = sortedRows.map((row) => payload.columns.map((column) => String(row[column.key] ?? '-')).join(' | '));
    for (const line of lines) {
      doc.text(line.slice(0, 130), 36, y);
      y += 14;
      if (y > 780) {
        doc.addPage();
        y = 36;
      }
    }
    doc.save(`${payload.reportType}_${payload.period.from}_${payload.period.to}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-gray-300">Relatórios Gerenciais Planejados</CardTitle>
          <CardDescription>Selecione o tipo de relatório, período e exporte os dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={reportType} onChange={(event) => setReportType(event.target.value as ReportType)}>
              {REPORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
            <Button onClick={() => void loadData()} className="bg-cyan-400 text-slate-900 hover:bg-cyan-300 font-bold">
              <Filter className="w-4 h-4 mr-2" /> Filtrar
            </Button>
          </div>
          <div className="rounded-lg border border-cyan-400/20 bg-slate-950/40 p-4 space-y-2">
            <p className="text-sm text-gray-300 font-semibold">Como usar este relatório</p>
            <p className="text-sm text-slate-200">{explanation.descricao}</p>
            <p className="text-sm text-slate-300">{explanation.decisoes}</p>
            <div className="space-y-1">
              {explanation.exemplosAcao.map((item) => (
                <p key={item} className="text-sm text-slate-400">- {item}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {payload ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {payload.kpis.map((kpi) => (
              <Card key={kpi.label} className="bg-[#0f172a] border-cyan-400/20">
                <CardHeader className="pb-2">
                  <CardDescription>{kpi.label}</CardDescription>
                  <CardTitle className="text-2xl text-white">{kpi.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="bg-[#0f172a] border-cyan-400/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">{payload.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10" onClick={exportCsv}>
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10" onClick={exportPdf}>
                  <FileDown className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Período: {payload.period.from} até {payload.period.to}
              </CardDescription>
              <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
                <Table className="w-full min-w-[1100px] border-separate border-spacing-y-2">
                  <TableHeader>
                    <TableRow className="border-none hover:bg-transparent">
                      {payload.columns.map((column) => (
                        <TableHead
                          key={column.key}
                          className={`text-left text-xs uppercase tracking-wide px-3 py-3 cursor-pointer ${isFinancialColumn(column) ? 'text-emerald-300' : 'text-gray-400'}`}
                          onClick={() => toggleSort(column.key)}
                        >
                          <span className="inline-flex items-center gap-1">
                            {column.label}
                            {sortBy === column.key ? (
                              sortDirection === 'asc' ? (
                                <ArrowUpAZ className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDownAZ className="w-3.5 h-3.5" />
                              )
                            ) : null}
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={payload.columns.length} className="text-center py-8 text-slate-400 border-b-0">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : sortedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={payload.columns.length} className="text-center py-8 text-slate-400 border-b-0">
                          Sem dados no período selecionado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedRows.map((row, index) => (
                        <TableRow key={`${payload.reportType}-${index}`} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                          {payload.columns.map((column) => (
                            <TableCell
                              key={`${column.key}-${index}`}
                              className={`px-3 py-3 border-b-0 ${isFinancialColumn(column) ? 'text-emerald-300 font-semibold' : 'text-slate-200'}`}
                            >
                              {formatCell(row[column.key] ?? '-')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-[#0f172a] border-cyan-400/20">
          <CardContent className="py-8 text-slate-400">{loading ? 'Carregando dados...' : 'Sem dados.'}</CardContent>
        </Card>
      )}
    </div>
  );
}
