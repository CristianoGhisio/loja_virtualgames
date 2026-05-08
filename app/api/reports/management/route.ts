import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

const reportTypes = [
  'product_profitability',
  'customer_profitability',
  'cash_flow_projected_realized',
  'abc_sales_margin',
  'stock_turnover_coverage',
  'dead_stock_opportunity',
  'sales_channel_payment',
  'commissions_performance',
  'os_sla',
  'rework_warranty_returns',
  'satisfaction_correlation',
  'cohort_clients',
  'funnel_effectiveness',
  'commission_by_technician',
  'revenue_by_origin',
  'service_financial_impact',
] as const;

const querySchema = z.object({
  reportType: z.enum(reportTypes),
  from: z.string().optional(),
  to: z.string().optional(),
});

type ReportType = (typeof reportTypes)[number];
type ReportKpi = { label: string; value: string };
type ReportColumn = { key: string; label: string };

const parseStart = (value?: string) => {
  const now = new Date();
  if (!value) return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const parseEnd = (value?: string) => {
  const now = new Date();
  if (!value) return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  parsed.setHours(23, 59, 59, 999);
  return parsed;
};

const asCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

const asPercent = (value: number) => `${value.toFixed(2)}%`;

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

async function buildProductProfitability(from: Date, to: Date) {
  const sales = await prisma.sale.findMany({
    where: { date: { gte: from, lte: to }, status: 'COMPLETED' },
    include: { items: { include: { product: true } } },
  });
  const map = new Map<string, { product: string; quantity: number; revenue: number; cost: number }>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.productId;
      const row = map.get(key) ?? { product: item.product.commercialName, quantity: 0, revenue: 0, cost: 0 };
      row.quantity += item.quantity;
      row.revenue += Number(item.total);
      row.cost += Number(item.costPrice) * item.quantity;
      map.set(key, row);
    }
  }
  const rows = Array.from(map.values())
    .map((item) => {
      const margin = item.revenue - item.cost;
      const marginPercent = item.revenue > 0 ? (margin / item.revenue) * 100 : 0;
      return {
        produto: item.product,
        quantidade: item.quantity,
        receita: Number(item.revenue.toFixed(2)),
        custo: Number(item.cost.toFixed(2)),
        margem: Number(margin.toFixed(2)),
        margemPercentual: Number(marginPercent.toFixed(2)),
      };
    })
    .sort((a, b) => b.margem - a.margem)
    .slice(0, 200);
  const totalRevenue = rows.reduce((acc, item) => acc + item.receita, 0);
  const totalMargin = rows.reduce((acc, item) => acc + item.margem, 0);
  const marginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  return {
    title: 'Rentabilidade por Produto',
    kpis: [
      { label: 'Receita Total', value: asCurrency(totalRevenue) },
      { label: 'Margem Total', value: asCurrency(totalMargin) },
      { label: 'Margem Média', value: asPercent(marginPercent) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'produto', label: 'Produto' },
      { key: 'quantidade', label: 'Qtd' },
      { key: 'receita', label: 'Receita' },
      { key: 'custo', label: 'Custo' },
      { key: 'margem', label: 'Margem' },
      { key: 'margemPercentual', label: 'Margem %' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildCustomerProfitability(from: Date, to: Date) {
  const sales = await prisma.sale.findMany({
    where: { date: { gte: from, lte: to }, status: 'COMPLETED' },
    include: { customer: true, items: true },
  });
  const map = new Map<string, { customer: string; salesCount: number; revenue: number; cost: number }>();
  for (const sale of sales) {
    const key = sale.customerId ?? 'consumidor-final';
    const label = sale.customer?.name ?? 'Consumidor final';
    const row = map.get(key) ?? { customer: label, salesCount: 0, revenue: 0, cost: 0 };
    row.salesCount += 1;
    row.revenue += Number(sale.total);
    row.cost += sale.items.reduce((acc, item) => acc + Number(item.costPrice) * item.quantity, 0);
    map.set(key, row);
  }
  const rows = Array.from(map.values())
    .map((item) => {
      const margin = item.revenue - item.cost;
      const marginPercent = item.revenue > 0 ? (margin / item.revenue) * 100 : 0;
      return {
        cliente: item.customer,
        compras: item.salesCount,
        receita: Number(item.revenue.toFixed(2)),
        custo: Number(item.cost.toFixed(2)),
        margem: Number(margin.toFixed(2)),
        margemPercentual: Number(marginPercent.toFixed(2)),
      };
    })
    .sort((a, b) => b.margem - a.margem)
    .slice(0, 200);
  const totalClients = rows.length;
  const averageTicket = rows.reduce((acc, item) => acc + item.receita, 0) / Math.max(1, totalClients);
  return {
    title: 'Rentabilidade por Cliente',
    kpis: [
      { label: 'Clientes no Período', value: String(totalClients) },
      { label: 'Ticket Médio', value: asCurrency(averageTicket) },
      { label: 'Maior Margem', value: rows[0] ? asCurrency(rows[0].margem) : asCurrency(0) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'cliente', label: 'Cliente' },
      { key: 'compras', label: 'Compras' },
      { key: 'receita', label: 'Receita' },
      { key: 'custo', label: 'Custo' },
      { key: 'margem', label: 'Margem' },
      { key: 'margemPercentual', label: 'Margem %' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildCashFlowProjectedRealized(from: Date, to: Date) {
  const [receivables, payables, movements] = await Promise.all([
    prisma.receivable.findMany({ where: { dueDate: { gte: from, lte: to } } }),
    prisma.payable.findMany({ where: { dueDate: { gte: from, lte: to } } }),
    prisma.cashMovement.findMany({ where: { date: { gte: from, lte: to } } }),
  ]);
  const map = new Map<string, { projectedIn: number; projectedOut: number; realizedIn: number; realizedOut: number }>();
  const ensureDay = (day: string) => {
    const current = map.get(day) ?? { projectedIn: 0, projectedOut: 0, realizedIn: 0, realizedOut: 0 };
    map.set(day, current);
    return current;
  };
  for (const receivable of receivables) {
    const day = receivable.dueDate.toISOString().slice(0, 10);
    const row = ensureDay(day);
    row.projectedIn += Number(receivable.value);
  }
  for (const payable of payables) {
    const day = payable.dueDate.toISOString().slice(0, 10);
    const row = ensureDay(day);
    row.projectedOut += Number(payable.value);
  }
  for (const movement of movements) {
    const day = movement.date.toISOString().slice(0, 10);
    const row = ensureDay(day);
    if (movement.type === 'IN') row.realizedIn += Number(movement.value);
    else row.realizedOut += Number(movement.value);
  }
  const rows = Array.from(map.entries())
    .map(([day, values]) => ({
      data: day,
      entradaProjetada: Number(values.projectedIn.toFixed(2)),
      saidaProjetada: Number(values.projectedOut.toFixed(2)),
      entradaRealizada: Number(values.realizedIn.toFixed(2)),
      saidaRealizada: Number(values.realizedOut.toFixed(2)),
      desvio: Number(((values.realizedIn - values.realizedOut) - (values.projectedIn - values.projectedOut)).toFixed(2)),
    }))
    .sort((a, b) => a.data.localeCompare(b.data));
  const projectedBalance = rows.reduce((acc, item) => acc + item.entradaProjetada - item.saidaProjetada, 0);
  const realizedBalance = rows.reduce((acc, item) => acc + item.entradaRealizada - item.saidaRealizada, 0);
  return {
    title: 'Fluxo de Caixa Projetado x Realizado',
    kpis: [
      { label: 'Saldo Projetado', value: asCurrency(projectedBalance) },
      { label: 'Saldo Realizado', value: asCurrency(realizedBalance) },
      { label: 'Desvio Total', value: asCurrency(realizedBalance - projectedBalance) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'data', label: 'Data' },
      { key: 'entradaProjetada', label: 'Entrada Projetada' },
      { key: 'saidaProjetada', label: 'Saída Projetada' },
      { key: 'entradaRealizada', label: 'Entrada Realizada' },
      { key: 'saidaRealizada', label: 'Saída Realizada' },
      { key: 'desvio', label: 'Desvio' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildAbcSalesMargin(from: Date, to: Date) {
  const base = await buildProductProfitability(from, to);
  const totalRevenue = base.rows.reduce((acc, row) => acc + Number(row.receita), 0);
  let cumulative = 0;
  const rows = base.rows.map((row) => {
    const revenue = Number(row.receita);
    const share = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
    cumulative += share;
    const cls = cumulative <= 80 ? 'A' : cumulative <= 95 ? 'B' : 'C';
    return {
      produto: String(row.produto),
      faturamento: revenue,
      margem: Number(row.margem),
      participacaoPercentual: Number(share.toFixed(2)),
      classe: cls,
    };
  });
  const classCount = rows.reduce(
    (acc, row) => {
      if (row.classe === 'A') acc.a += 1;
      if (row.classe === 'B') acc.b += 1;
      if (row.classe === 'C') acc.c += 1;
      return acc;
    },
    { a: 0, b: 0, c: 0 }
  );
  return {
    title: 'Curva ABC de Vendas e Margem',
    kpis: [
      { label: 'Classe A', value: String(classCount.a) },
      { label: 'Classe B', value: String(classCount.b) },
      { label: 'Classe C', value: String(classCount.c) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'produto', label: 'Produto' },
      { key: 'faturamento', label: 'Faturamento' },
      { key: 'margem', label: 'Margem' },
      { key: 'participacaoPercentual', label: 'Participação %' },
      { key: 'classe', label: 'Classe' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildStockTurnoverCoverage(from: Date, to: Date) {
  const [stocks, saleItems] = await Promise.all([
    prisma.stock.findMany({ include: { product: true } }),
    prisma.saleItem.findMany({
      where: { sale: { date: { gte: from, lte: to }, status: 'COMPLETED' } },
      include: { product: true },
    }),
  ]);
  const soldByProduct = new Map<string, number>();
  for (const item of saleItems) {
    soldByProduct.set(item.productId, (soldByProduct.get(item.productId) ?? 0) + item.quantity);
  }
  const periodDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
  const rows = stocks.map((stock) => {
    const sold = soldByProduct.get(stock.productId) ?? 0;
    const daily = sold / periodDays;
    const coverage = daily > 0 ? stock.quantity / daily : 9999;
    const turnover = stock.quantity > 0 ? sold / stock.quantity : sold;
    return {
      produto: stock.product.commercialName,
      estoqueAtual: stock.quantity,
      vendidoPeriodo: sold,
      giro: Number(turnover.toFixed(2)),
      coberturaDias: Number(coverage.toFixed(2)),
      estoqueMinimo: stock.minStock,
    };
  }).sort((a, b) => a.coberturaDias - b.coberturaDias);
  const avgCoverage = rows.reduce((acc, item) => acc + item.coberturaDias, 0) / Math.max(1, rows.length);
  return {
    title: 'Giro e Cobertura de Estoque',
    kpis: [
      { label: 'Itens em Estoque', value: String(rows.length) },
      { label: 'Cobertura Média', value: `${avgCoverage.toFixed(1)} dias` },
      { label: 'Risco de Ruptura', value: String(rows.filter((item) => item.estoqueAtual <= item.estoqueMinimo).length) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'produto', label: 'Produto' },
      { key: 'estoqueAtual', label: 'Estoque Atual' },
      { key: 'vendidoPeriodo', label: 'Vendido no Período' },
      { key: 'giro', label: 'Giro' },
      { key: 'coberturaDias', label: 'Cobertura (dias)' },
      { key: 'estoqueMinimo', label: 'Estoque Mínimo' },
    ] satisfies ReportColumn[],
    rows: rows.slice(0, 300),
  };
}

async function buildDeadStockOpportunity() {
  const [stocks, movements] = await Promise.all([
    prisma.stock.findMany({ include: { product: true } }),
    prisma.stockMovement.findMany({
      where: { type: 'OUT_SALE' },
      orderBy: { createdAt: 'desc' },
      select: { productId: true, createdAt: true },
    }),
  ]);
  const latestOutSaleByProduct = new Map<string, Date>();
  for (const movement of movements) {
    if (!latestOutSaleByProduct.has(movement.productId)) latestOutSaleByProduct.set(movement.productId, movement.createdAt);
  }
  const now = new Date();
  const rows = stocks
    .map((stock) => {
      const latestSale = latestOutSaleByProduct.get(stock.productId);
      const diffMs = latestSale ? now.getTime() - latestSale.getTime() : now.getTime() - stock.product.createdAt.getTime();
      const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      const immobilized = Number(stock.totalValue || 0);
      const criticidade = days >= 180 ? 'ALTA' : days >= 90 ? 'MÉDIA' : 'BAIXA';
      return {
        produto: stock.product.commercialName,
        diasSemGiro: days,
        quantidade: stock.quantity,
        valorImobilizado: Number(immobilized.toFixed(2)),
        criticidade,
      };
    })
    .filter((item) => item.quantidade > 0)
    .sort((a, b) => b.diasSemGiro - a.diasSemGiro)
    .slice(0, 300);
  const total = rows.reduce((acc, item) => acc + item.valorImobilizado, 0);
  return {
    title: 'Estoque Parado com Custo de Oportunidade',
    kpis: [
      { label: 'Valor Imobilizado', value: asCurrency(total) },
      { label: 'Itens Críticos', value: String(rows.filter((item) => item.criticidade === 'ALTA').length) },
      { label: 'Itens Mapeados', value: String(rows.length) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'produto', label: 'Produto' },
      { key: 'diasSemGiro', label: 'Dias sem Giro' },
      { key: 'quantidade', label: 'Quantidade' },
      { key: 'valorImobilizado', label: 'Valor Imobilizado' },
      { key: 'criticidade', label: 'Criticidade' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildSalesChannelPayment(from: Date, to: Date) {
  const [sales, receivables] = await Promise.all([
    prisma.sale.findMany({
      where: { date: { gte: from, lte: to }, status: 'COMPLETED' },
      include: { customer: true },
    }),
    prisma.receivable.findMany({
      where: { paidAt: { gte: from, lte: to }, status: 'PAID', saleId: { not: null } },
    }),
  ]);
  const receivableMap = new Map<string, { gross: number; net: number; fees: number }>();
  for (const rec of receivables) {
    if (!rec.saleId) continue;
    receivableMap.set(rec.saleId, {
      gross: Number(rec.value),
      net: Number(rec.netValue ?? rec.value),
      fees: Number(rec.cardFeeValue ?? 0),
    });
  }
  const map = new Map<string, { canal: string; pagamento: string; vendas: number; bruto: number; liquido: number; taxas: number }>();
  for (const sale of sales) {
    const canal = sale.customerId ? 'Com Cliente Cadastrado' : 'Consumidor Final';
    const pagamento = sale.paymentMethod;
    const key = `${canal}::${pagamento}`;
    const rec = receivableMap.get(sale.id);
    const gross = rec?.gross ?? Number(sale.total);
    const net = rec?.net ?? Number(sale.total);
    const fee = rec?.fees ?? 0;
    const row = map.get(key) ?? { canal, pagamento, vendas: 0, bruto: 0, liquido: 0, taxas: 0 };
    row.vendas += 1;
    row.bruto += gross;
    row.liquido += net;
    row.taxas += fee;
    map.set(key, row);
  }
  const rows = Array.from(map.values())
    .map((item) => ({
      canal: item.canal,
      pagamento: item.pagamento,
      vendas: item.vendas,
      faturamentoBruto: Number(item.bruto.toFixed(2)),
      taxas: Number(item.taxas.toFixed(2)),
      faturamentoLiquido: Number(item.liquido.toFixed(2)),
      margemLiquidaPercentual: item.bruto > 0 ? Number(((item.liquido / item.bruto) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.faturamentoLiquido - a.faturamentoLiquido);
  const gross = rows.reduce((acc, item) => acc + item.faturamentoBruto, 0);
  const net = rows.reduce((acc, item) => acc + item.faturamentoLiquido, 0);
  return {
    title: 'Desempenho por Canal e Meio de Pagamento',
    kpis: [
      { label: 'Faturamento Bruto', value: asCurrency(gross) },
      { label: 'Faturamento Líquido', value: asCurrency(net) },
      { label: 'Taxas', value: asCurrency(gross - net) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'canal', label: 'Canal' },
      { key: 'pagamento', label: 'Pagamento' },
      { key: 'vendas', label: 'Vendas' },
      { key: 'faturamentoBruto', label: 'Bruto' },
      { key: 'taxas', label: 'Taxas' },
      { key: 'faturamentoLiquido', label: 'Líquido' },
      { key: 'margemLiquidaPercentual', label: 'Líquido %' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildCommissionsPerformance(from: Date, to: Date) {
  const [sales, users, receivables] = await Promise.all([
    prisma.sale.findMany({
      where: { date: { gte: from, lte: to }, status: 'COMPLETED', createdBy: { not: null } },
      include: { items: true },
    }),
    prisma.user.findMany({ select: { id: true, name: true } }),
    prisma.receivable.findMany({ where: { saleId: { not: null }, status: 'PAID', paidAt: { gte: from, lte: to } } }),
  ]);
  const userMap = new Map(users.map((item) => [item.id, item.name || item.id]));
  const paidBySaleId = new Map(receivables.filter((item) => item.saleId).map((item) => [String(item.saleId), Number(item.netValue ?? item.value)]));
  const commissionPercent = 2.5;
  const map = new Map<string, { colaborador: string; vendas: number; receitaLiquida: number; margem: number }>();
  for (const sale of sales) {
    const userId = sale.createdBy as string;
    const row = map.get(userId) ?? { colaborador: userMap.get(userId) ?? userId, vendas: 0, receitaLiquida: 0, margem: 0 };
    row.vendas += 1;
    row.receitaLiquida += paidBySaleId.get(sale.id) ?? Number(sale.total);
    row.margem += sale.items.reduce((acc, item) => acc + Number(item.total) - Number(item.costPrice) * item.quantity, 0);
    map.set(userId, row);
  }
  const rows = Array.from(map.values())
    .map((item) => ({
      colaborador: item.colaborador,
      vendas: item.vendas,
      receitaLiquida: Number(item.receitaLiquida.toFixed(2)),
      margemGerada: Number(item.margem.toFixed(2)),
      comissaoPercentual: commissionPercent,
      comissaoValor: Number(((item.receitaLiquida * commissionPercent) / 100).toFixed(2)),
    }))
    .sort((a, b) => b.comissaoValor - a.comissaoValor);
  return {
    title: 'Comissões e Performance por Colaborador',
    kpis: [
      { label: 'Comissão Total', value: asCurrency(rows.reduce((acc, item) => acc + item.comissaoValor, 0)) },
      { label: 'Colaboradores', value: String(rows.length) },
      { label: 'Receita Líquida', value: asCurrency(rows.reduce((acc, item) => acc + item.receitaLiquida, 0)) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'colaborador', label: 'Colaborador' },
      { key: 'vendas', label: 'Vendas' },
      { key: 'receitaLiquida', label: 'Receita Líquida' },
      { key: 'margemGerada', label: 'Margem Gerada' },
      { key: 'comissaoPercentual', label: 'Comissão %' },
      { key: 'comissaoValor', label: 'Comissão R$' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildOsSla(from: Date, to: Date) {
  const orders = await prisma.serviceOrder.findMany({
    where: { entryDate: { gte: from, lte: to } },
    include: { technician: { select: { name: true } }, history: true },
    orderBy: { entryDate: 'desc' },
  });
  const now = new Date();
  const rows = orders.map((order) => {
    const end = order.endDate ?? now;
    const leadTime = Math.max(0, Math.round((end.getTime() - order.entryDate.getTime()) / (1000 * 60 * 60 * 24)));
    const stageCount = order.history.length;
    return {
      os: order.id,
      tecnico: order.technician?.name ?? 'Não atribuído',
      entrada: order.entryDate.toISOString().slice(0, 10),
      entrega: order.endDate ? order.endDate.toISOString().slice(0, 10) : '-',
      leadTimeDias: leadTime,
      status: order.status,
      transicoes: stageCount,
      prioridade: order.priority,
    };
  });
  const avgLead = rows.reduce((acc, item) => acc + item.leadTimeDias, 0) / Math.max(1, rows.length);
  return {
    title: 'SLA de Ordens de Serviço',
    kpis: [
      { label: 'OS no Período', value: String(rows.length) },
      { label: 'Lead Time Médio', value: `${avgLead.toFixed(1)} dias` },
      { label: 'OS Abertas', value: String(rows.filter((item) => item.entrega === '-').length) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'os', label: 'OS' },
      { key: 'tecnico', label: 'Técnico' },
      { key: 'entrada', label: 'Entrada' },
      { key: 'entrega', label: 'Entrega' },
      { key: 'leadTimeDias', label: 'Lead Time (dias)' },
      { key: 'status', label: 'Status' },
      { key: 'transicoes', label: 'Transições' },
      { key: 'prioridade', label: 'Prioridade' },
    ] satisfies ReportColumn[],
    rows: rows.slice(0, 300),
  };
}

async function buildReworkWarrantyReturns(from: Date, to: Date) {
  const returns = await prisma.saleReturn.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { items: true, sale: true, customer: true },
    orderBy: { createdAt: 'desc' },
  });
  const rows = returns.map((item) => ({
    referencia: item.saleId,
    cliente: item.customer?.name ?? 'Consumidor final',
    tipo: item.type,
    motivo: item.reason,
    status: item.status,
    custoEstimado: Number(
      item.items.reduce((acc, row) => acc + Number(row.unitPrice) * row.quantity, 0).toFixed(2)
    ),
    data: item.createdAt.toISOString().slice(0, 10),
  }));
  const cost = rows.reduce((acc, item) => acc + item.custoEstimado, 0);
  return {
    title: 'Retrabalho, Garantia e Devoluções',
    kpis: [
      { label: 'Ocorrências', value: String(rows.length) },
      { label: 'Custo Estimado', value: asCurrency(cost) },
      { label: 'Pendentes', value: String(rows.filter((item) => item.status === 'PENDING').length) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'referencia', label: 'Referência' },
      { key: 'cliente', label: 'Cliente' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'motivo', label: 'Motivo' },
      { key: 'status', label: 'Status' },
      { key: 'custoEstimado', label: 'Custo Estimado' },
      { key: 'data', label: 'Data' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildSatisfactionCorrelation(from: Date, to: Date) {
  let ratingsByType: Array<{ tipo: string; media: number; respostas: number; receitaMediaCliente: number }> = [];
  try {
    const salesRatings = await prisma.$queryRaw<Array<{ customerId: string; rating: number }>>(Prisma.sql`
      SELECT "customerId", "rating"
      FROM "CustomerSaleSatisfaction"
      WHERE "createdAt" >= ${from}
        AND "createdAt" <= ${to}
    `);
    const serviceRatings = await prisma.$queryRaw<Array<{ customerId: string; rating: number }>>(Prisma.sql`
      SELECT "customerId", "rating"
      FROM "CustomerServiceSatisfaction"
      WHERE "createdAt" >= ${from}
        AND "createdAt" <= ${to}
    `);
    const salesByCustomer = await prisma.sale.groupBy({
      by: ['customerId'],
      _sum: { total: true },
      where: { status: 'COMPLETED', customerId: { not: null } },
    });
    const revenueMap = new Map(salesByCustomer.map((item) => [String(item.customerId), Number(item._sum.total ?? 0)]));
    const calc = (rows: Array<{ customerId: string; rating: number }>, tipo: string) => {
      const responses = rows.length;
      const avgRating = responses > 0 ? rows.reduce((acc, item) => acc + item.rating, 0) / responses : 0;
      const avgRevenue = responses > 0
        ? rows.reduce((acc, item) => acc + (revenueMap.get(item.customerId) ?? 0), 0) / responses
        : 0;
      return { tipo, media: Number(avgRating.toFixed(2)), respostas: responses, receitaMediaCliente: Number(avgRevenue.toFixed(2)) };
    };
    ratingsByType = [calc(salesRatings, 'VENDA'), calc(serviceRatings, 'SERVIÇO')];
  } catch {
    ratingsByType = [];
  }
  return {
    title: 'Satisfação com Correlação de Resultado',
    kpis: [
      { label: 'Tipos com Dados', value: String(ratingsByType.length) },
      {
        label: 'Média Geral',
        value: ratingsByType.length
          ? (ratingsByType.reduce((acc, item) => acc + item.media, 0) / ratingsByType.length).toFixed(2)
          : '0.00',
      },
      { label: 'Respostas', value: String(ratingsByType.reduce((acc, item) => acc + item.respostas, 0)) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'tipo', label: 'Tipo' },
      { key: 'media', label: 'Nota Média' },
      { key: 'respostas', label: 'Respostas' },
      { key: 'receitaMediaCliente', label: 'Receita Média por Cliente' },
    ] satisfies ReportColumn[],
    rows: ratingsByType,
  };
}

async function buildCohortClients(to: Date) {
  const sales = await prisma.sale.findMany({
    where: { status: 'COMPLETED', customerId: { not: null }, date: { lte: to } },
    select: { customerId: true, date: true },
    orderBy: { date: 'asc' },
  });
  const firstPurchaseByCustomer = new Map<string, Date>();
  const activityByCustomer = new Map<string, Set<string>>();
  for (const sale of sales) {
    const customerId = String(sale.customerId);
    if (!firstPurchaseByCustomer.has(customerId)) firstPurchaseByCustomer.set(customerId, sale.date);
    const periods = activityByCustomer.get(customerId) ?? new Set<string>();
    periods.add(monthKey(sale.date));
    activityByCustomer.set(customerId, periods);
  }
  const cohortMap = new Map<string, { cohort: string; clientes: number; mesesAtivos: number }>();
  for (const [customerId, firstDate] of firstPurchaseByCustomer.entries()) {
    const cohort = monthKey(firstDate);
    const activity = activityByCustomer.get(customerId) ?? new Set<string>();
    const row = cohortMap.get(cohort) ?? { cohort, clientes: 0, mesesAtivos: 0 };
    row.clientes += 1;
    row.mesesAtivos += activity.size;
    cohortMap.set(cohort, row);
  }
  const rows = Array.from(cohortMap.values())
    .map((item) => ({
      cohort: item.cohort,
      clientes: item.clientes,
      mediaMesesAtivos: Number((item.mesesAtivos / Math.max(1, item.clientes)).toFixed(2)),
      retencaoAproximada: Number((((item.mesesAtivos / Math.max(1, item.clientes)) / 6) * 100).toFixed(2)),
    }))
    .sort((a, b) => a.cohort.localeCompare(b.cohort));
  return {
    title: 'Cohort de Clientes',
    kpis: [
      { label: 'Cohorts', value: String(rows.length) },
      { label: 'Clientes Totais', value: String(rows.reduce((acc, item) => acc + item.clientes, 0)) },
      {
        label: 'Retenção Média',
        value: rows.length
          ? `${(rows.reduce((acc, item) => acc + item.retencaoAproximada, 0) / rows.length).toFixed(2)}%`
          : '0.00%',
      },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'cohort', label: 'Cohort' },
      { key: 'clientes', label: 'Clientes' },
      { key: 'mediaMesesAtivos', label: 'Média Meses Ativos' },
      { key: 'retencaoAproximada', label: 'Retenção Aproximada %' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildFunnelEffectiveness() {
  const cards = await prisma.customerFunnelCard.findMany({ where: { active: true } });
  const stageMap = new Map<string, number>();
  for (const card of cards) {
    stageMap.set(card.stage, (stageMap.get(card.stage) ?? 0) + 1);
  }
  const total = cards.length;
  const rows = Array.from(stageMap.entries())
    .map(([stage, count]) => ({
      estagio: stage,
      totalClientes: count,
      taxaPassagem: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.totalClientes - a.totalClientes);
  const converted = (stageMap.get('VENDA_CONCLUIDA') ?? 0) + (stageMap.get('FINALIZADO') ?? 0);
  return {
    title: 'Efetividade do Funil de Atendimento',
    kpis: [
      { label: 'Leads Ativos', value: String(total) },
      { label: 'Conversões', value: String(converted) },
      { label: 'Taxa Conversão', value: total > 0 ? `${((converted / total) * 100).toFixed(2)}%` : '0.00%' },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'estagio', label: 'Estágio' },
      { key: 'totalClientes', label: 'Total de Clientes' },
      { key: 'taxaPassagem', label: 'Taxa %' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildCommissionByTechnician(from: Date, to: Date) {
  const provisions = await prisma.serviceCommissionProvision.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    orderBy: { createdAt: 'desc' },
  });
  const technicians = await prisma.user.findMany({
    where: { id: { in: provisions.map((item) => item.technicianUserId) } },
    select: { id: true, name: true, email: true },
  });
  const services = await prisma.service.findMany({
    where: { id: { in: provisions.map((item) => item.serviceId).filter((item): item is string => Boolean(item)) } },
    select: { id: true, name: true },
  });
  const technicianMap = new Map(technicians.map((item) => [item.id, item.name ?? item.email ?? item.id]));
  const serviceMap = new Map(services.map((item) => [item.id, item.name]));

  const rows = provisions.map((item) => ({
    tecnico: technicianMap.get(item.technicianUserId) ?? item.technicianUserId,
    os: item.serviceOrderId,
    servico: item.serviceId ? serviceMap.get(item.serviceId) ?? item.serviceId : '-',
    dataPagamentoServico: item.createdAt.toISOString().slice(0, 10),
    valorServico: Number(item.baseAmount),
    percentualComissao: Number(item.commissionPercent),
    valorComissao: Number(item.commissionAmount),
    status: item.status,
  }));

  const totalProvisioned = rows
    .filter((item) => item.status === 'PROVISIONED')
    .reduce((acc, item) => acc + item.valorComissao, 0);
  const totalPaid = rows
    .filter((item) => item.status === 'PAID')
    .reduce((acc, item) => acc + item.valorComissao, 0);

  const pendingByTech = new Map<string, number>();
  for (const row of rows) {
    if (row.status !== 'PROVISIONED') continue;
    pendingByTech.set(row.tecnico, (pendingByTech.get(row.tecnico) ?? 0) + row.valorComissao);
  }
  const pendingTop = Array.from(pendingByTech.values()).sort((a, b) => b - a)[0] ?? 0;

  return {
    title: 'Comissão por Técnico (Mensal)',
    kpis: [
      { label: 'Comissão Provisionada', value: asCurrency(totalProvisioned) },
      { label: 'Comissão Paga', value: asCurrency(totalPaid) },
      { label: 'Maior Pendência Técnica', value: asCurrency(pendingTop) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'tecnico', label: 'Técnico' },
      { key: 'os', label: 'OS' },
      { key: 'servico', label: 'Serviço' },
      { key: 'dataPagamentoServico', label: 'Data Pagamento' },
      { key: 'valorServico', label: 'Valor Serviço' },
      { key: 'percentualComissao', label: 'Comissão %' },
      { key: 'valorComissao', label: 'Comissão R$' },
      { key: 'status', label: 'Status' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildRevenueByOrigin(from: Date, to: Date) {
  const receivables = await prisma.receivable.findMany({
    where: {
      status: 'PAID',
      paidAt: { gte: from, lte: to },
      origin: { in: ['MANUAL', 'SALE', 'SERVICE'] },
    },
    select: {
      id: true,
      origin: true,
      value: true,
      netValue: true,
      serviceOrderId: true,
    },
  });
  const serviceOrderIds = receivables
    .map((item) => item.serviceOrderId)
    .filter((item): item is string => Boolean(item));
  const provisions = serviceOrderIds.length
    ? await prisma.serviceCommissionProvision.groupBy({
        by: ['serviceOrderId'],
        where: {
          serviceOrderId: { in: serviceOrderIds },
          status: { in: ['PROVISIONED', 'PAID'] },
        },
        _sum: { commissionAmount: true },
      })
    : [];
  const commissionByServiceOrder = new Map(
    provisions.map((item) => [item.serviceOrderId, Number(item._sum.commissionAmount ?? 0)])
  );

  const map = new Map<'MANUAL' | 'SALE' | 'SERVICE', { origem: string; quantidadeLancamentos: number; valorBruto: number; comissaoVinculada: number; valorLiquido: number }>();
  for (const receivable of receivables) {
    const key = receivable.origin;
    const label = key === 'MANUAL' ? 'Manual' : key === 'SALE' ? 'Venda de produto' : 'Serviço pago';
    const row = map.get(key) ?? {
      origem: label,
      quantidadeLancamentos: 0,
      valorBruto: 0,
      comissaoVinculada: 0,
      valorLiquido: 0,
    };
    row.quantidadeLancamentos += 1;
    row.valorBruto += Number(receivable.value);
    row.valorLiquido += Number(receivable.netValue ?? receivable.value);
    if (key === 'SERVICE') {
      row.comissaoVinculada += Number(commissionByServiceOrder.get(receivable.serviceOrderId ?? '') ?? 0);
    }
    map.set(key, row);
  }
  const rows = Array.from(map.values()).map((item) => ({
    ...item,
    valorBruto: Number(item.valorBruto.toFixed(2)),
    comissaoVinculada: Number(item.comissaoVinculada.toFixed(2)),
    valorLiquido: Number(item.valorLiquido.toFixed(2)),
  }));
  return {
    title: 'Receita por Origem',
    kpis: [
      { label: 'Bruto Total', value: asCurrency(rows.reduce((acc, item) => acc + item.valorBruto, 0)) },
      { label: 'Comissão Vinculada', value: asCurrency(rows.reduce((acc, item) => acc + item.comissaoVinculada, 0)) },
      { label: 'Líquido Total', value: asCurrency(rows.reduce((acc, item) => acc + item.valorLiquido, 0)) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'origem', label: 'Origem' },
      { key: 'quantidadeLancamentos', label: 'Lançamentos' },
      { key: 'valorBruto', label: 'Valor Bruto' },
      { key: 'comissaoVinculada', label: 'Comissão' },
      { key: 'valorLiquido', label: 'Valor Líquido' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function buildServiceFinancialImpact(from: Date, to: Date) {
  const provisions = await prisma.serviceCommissionProvision.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    orderBy: { createdAt: 'desc' },
  });
  const technicians = await prisma.user.findMany({
    where: { id: { in: provisions.map((item) => item.technicianUserId) } },
    select: { id: true, name: true, email: true },
  });
  const services = await prisma.service.findMany({
    where: { id: { in: provisions.map((item) => item.serviceId).filter((item): item is string => Boolean(item)) } },
    select: { id: true, name: true },
  });
  const technicianMap = new Map(technicians.map((item) => [item.id, item.name ?? item.email ?? item.id]));
  const serviceMap = new Map(services.map((item) => [item.id, item.name]));

  const map = new Map<string, {
    servico: string;
    tecnico: string;
    qtdExecutada: number;
    faturamentoBruto: number;
    comissaoTotal: number;
    receitaLiquidaServico: number;
  }>();

  for (const item of provisions) {
    const serviceLabel = item.serviceId ? serviceMap.get(item.serviceId) ?? item.serviceId : 'Serviço não identificado';
    const techLabel = technicianMap.get(item.technicianUserId) ?? item.technicianUserId;
    const key = `${serviceLabel}::${techLabel}`;
    const row = map.get(key) ?? {
      servico: serviceLabel,
      tecnico: techLabel,
      qtdExecutada: 0,
      faturamentoBruto: 0,
      comissaoTotal: 0,
      receitaLiquidaServico: 0,
    };
    row.qtdExecutada += 1;
    row.faturamentoBruto += Number(item.baseAmount);
    row.comissaoTotal += Number(item.commissionAmount);
    row.receitaLiquidaServico += Number(item.baseAmount) - Number(item.commissionAmount);
    map.set(key, row);
  }

  const rows = Array.from(map.values())
    .map((item) => ({
      ...item,
      faturamentoBruto: Number(item.faturamentoBruto.toFixed(2)),
      comissaoTotal: Number(item.comissaoTotal.toFixed(2)),
      receitaLiquidaServico: Number(item.receitaLiquidaServico.toFixed(2)),
    }))
    .sort((a, b) => b.receitaLiquidaServico - a.receitaLiquidaServico);

  return {
    title: 'Serviços com Impacto Financeiro',
    kpis: [
      { label: 'Faturamento Bruto', value: asCurrency(rows.reduce((acc, item) => acc + item.faturamentoBruto, 0)) },
      { label: 'Comissão Total', value: asCurrency(rows.reduce((acc, item) => acc + item.comissaoTotal, 0)) },
      { label: 'Receita Líquida', value: asCurrency(rows.reduce((acc, item) => acc + item.receitaLiquidaServico, 0)) },
    ] satisfies ReportKpi[],
    columns: [
      { key: 'servico', label: 'Serviço' },
      { key: 'tecnico', label: 'Técnico' },
      { key: 'qtdExecutada', label: 'Qtd.' },
      { key: 'faturamentoBruto', label: 'Bruto' },
      { key: 'comissaoTotal', label: 'Comissão' },
      { key: 'receitaLiquidaServico', label: 'Líquido' },
    ] satisfies ReportColumn[],
    rows,
  };
}

async function resolveReport(reportType: ReportType, from: Date, to: Date) {
  if (reportType === 'product_profitability') return buildProductProfitability(from, to);
  if (reportType === 'customer_profitability') return buildCustomerProfitability(from, to);
  if (reportType === 'cash_flow_projected_realized') return buildCashFlowProjectedRealized(from, to);
  if (reportType === 'abc_sales_margin') return buildAbcSalesMargin(from, to);
  if (reportType === 'stock_turnover_coverage') return buildStockTurnoverCoverage(from, to);
  if (reportType === 'dead_stock_opportunity') return buildDeadStockOpportunity();
  if (reportType === 'sales_channel_payment') return buildSalesChannelPayment(from, to);
  if (reportType === 'commissions_performance') return buildCommissionsPerformance(from, to);
  if (reportType === 'os_sla') return buildOsSla(from, to);
  if (reportType === 'rework_warranty_returns') return buildReworkWarrantyReturns(from, to);
  if (reportType === 'satisfaction_correlation') return buildSatisfactionCorrelation(from, to);
  if (reportType === 'cohort_clients') return buildCohortClients(to);
  if (reportType === 'commission_by_technician') return buildCommissionByTechnician(from, to);
  if (reportType === 'revenue_by_origin') return buildRevenueByOrigin(from, to);
  if (reportType === 'service_financial_impact') return buildServiceFinancialImpact(from, to);
  return buildFunnelEffectiveness();
}

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.parse({
      reportType: searchParams.get('reportType'),
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
    });
    const from = parseStart(parsed.from);
    const to = parseEnd(parsed.to);
    const data = await resolveReport(parsed.reportType, from, to);
    return successResponse({
      reportType: parsed.reportType,
      period: {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      },
      ...data,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
