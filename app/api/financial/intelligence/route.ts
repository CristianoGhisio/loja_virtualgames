import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  reportType: z.enum(['receivables', 'payables', 'cash_movements', 'profitability_customer', 'profitability_product']).optional(),
  columns: z.string().optional(),
  commissionPercent: z.coerce.number().min(0).max(100).optional(),
  budgetRevenue: z.coerce.number().min(0).optional(),
  budgetExpense: z.coerce.number().min(0).optional(),
});

const toStart = (value?: string) => {
  const current = new Date();
  if (!value) return new Date(current.getFullYear(), current.getMonth(), 1, 0, 0, 0, 0);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date(current.getFullYear(), current.getMonth(), 1, 0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toEnd = (value?: string) => {
  const current = new Date();
  if (!value) return new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
  date.setHours(23, 59, 59, 999);
  return date;
};

const daysDiff = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

const bucketAging = (dueDate: Date, now: Date) => {
  const overdueDays = Math.max(0, daysDiff(now, dueDate));
  if (overdueDays === 0) return 'A vencer';
  if (overdueDays <= 30) return '1-30';
  if (overdueDays <= 60) return '31-60';
  if (overdueDays <= 90) return '61-90';
  return '90+';
};

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.parse({
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
      reportType: searchParams.get('reportType') ?? undefined,
      columns: searchParams.get('columns') ?? undefined,
      commissionPercent: searchParams.get('commissionPercent') ?? undefined,
      budgetRevenue: searchParams.get('budgetRevenue') ?? undefined,
      budgetExpense: searchParams.get('budgetExpense') ?? undefined,
    });

    const from = toStart(parsed.from);
    const to = toEnd(parsed.to);
    const now = new Date();
    const commissionPercent = parsed.commissionPercent ?? 2.5;

    const [receivablesRange, payablesRange, paidReceivablesRange, paidPayablesRange, cashMovementsRange, receivablesOpen, payablesOpen, salesRange, paidCardReceivables, users] = await Promise.all([
      prisma.receivable.findMany({
        where: { dueDate: { gte: from, lte: to } },
        include: { customer: true, sale: true, serviceOrder: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.payable.findMany({
        where: { dueDate: { gte: from, lte: to } },
        include: { supplier: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.receivable.findMany({
        where: { status: 'PAID', paidAt: { gte: from, lte: to } },
        include: { customer: true, sale: true },
      }),
      prisma.payable.findMany({
        where: { status: 'PAID', updatedAt: { gte: from, lte: to } },
      }),
      prisma.cashMovement.findMany({
        where: { date: { gte: from, lte: to } },
        orderBy: { date: 'desc' },
      }),
      prisma.receivable.findMany({
        where: { status: { not: 'PAID' } },
      }),
      prisma.payable.findMany({
        where: { status: { not: 'PAID' } },
      }),
      prisma.sale.findMany({
        where: { date: { gte: from, lte: to }, status: 'COMPLETED' },
        include: { items: { include: { product: true } }, customer: true },
      }),
      prisma.receivable.findMany({
        where: {
          status: 'PAID',
          paymentMethod: { in: ['CARTAO', 'CREDITO', 'DEBITO'] },
          paidAt: { gte: from, lte: to },
        },
        include: { customer: true },
      }),
      prisma.user.findMany({
        select: { id: true, name: true },
      }),
    ]);

    const totalRevenue = paidReceivablesRange.reduce((acc, item) => acc + Number(item.netValue ?? item.value), 0);
    const totalExpense = paidPayablesRange.reduce((acc, item) => acc + Number(item.value), 0);
    const currentBalance = totalRevenue - totalExpense;
    const receivableOpenValue = receivablesOpen.reduce((acc, item) => acc + Number(item.value), 0);
    const payableOpenValue = payablesOpen.reduce((acc, item) => acc + Number(item.value), 0);

    const overdueReceivables = receivablesOpen.filter((item) => item.dueDate < now);
    const overduePayables = payablesOpen.filter((item) => item.dueDate < now);

    const historicalPaid = await prisma.receivable.findMany({
      where: { status: 'PAID', paidAt: { not: null } },
      select: { dueDate: true, paidAt: true },
      orderBy: { paidAt: 'desc' },
      take: 500,
    });
    const averageDelay = historicalPaid.length === 0
      ? 0
      : historicalPaid.reduce((acc, item) => acc + daysDiff(item.paidAt as Date, item.dueDate), 0) / historicalPaid.length;
    const delayFactor = Math.max(0.5, Math.min(1.2, 1 - averageDelay / 100));

    const forecastMap = new Map<string, { in: number; out: number }>();
    for (const receivable of receivablesOpen) {
      const day = receivable.dueDate.toISOString().slice(0, 10);
      const current = forecastMap.get(day) ?? { in: 0, out: 0 };
      current.in += Number(receivable.value) * delayFactor;
      forecastMap.set(day, current);
    }
    for (const payable of payablesOpen) {
      const day = payable.dueDate.toISOString().slice(0, 10);
      const current = forecastMap.get(day) ?? { in: 0, out: 0 };
      current.out += Number(payable.value);
      forecastMap.set(day, current);
    }
    const forecast = Array.from(forecastMap.entries())
      .map(([date, values]) => ({
        date,
        entry: Number(values.in.toFixed(2)),
        exit: Number(values.out.toFixed(2)),
        net: Number((values.in - values.out).toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 90);

    const months: Array<{ key: string; in: number; out: number }> = [];
    for (let i = 11; i >= 0; i -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const inMonth = paidReceivablesRange
        .filter((item) => item.paidAt && item.paidAt >= start && item.paidAt <= end)
        .reduce((acc, item) => acc + Number(item.netValue ?? item.value), 0);
      const outMonth = paidPayablesRange
        .filter((item) => item.updatedAt >= start && item.updatedAt <= end)
        .reduce((acc, item) => acc + Number(item.value), 0);
      months.push({
        key: `${String(start.getMonth() + 1).padStart(2, '0')}/${start.getFullYear()}`,
        in: Number(inMonth.toFixed(2)),
        out: Number(outMonth.toFixed(2)),
      });
    }

    const receivableAging = { 'A vencer': 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    for (const row of receivablesOpen) {
      const bucket = bucketAging(row.dueDate, now) as keyof typeof receivableAging;
      // eslint-disable-next-line security/detect-object-injection
      receivableAging[bucket] += Number(row.value);
    }
    const payableAging = { 'A vencer': 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    for (const row of payablesOpen) {
      const bucket = bucketAging(row.dueDate, now) as keyof typeof payableAging;
      // eslint-disable-next-line security/detect-object-injection
      payableAging[bucket] += Number(row.value);
    }

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const dueSoonEnd = new Date(todayStart);
    dueSoonEnd.setDate(dueSoonEnd.getDate() + 7);
    dueSoonEnd.setHours(23, 59, 59, 999);

    const alertItems = [
      ...receivablesOpen
        .filter((item) => item.dueDate >= todayStart && item.dueDate <= dueSoonEnd)
        .map((item) => ({
          id: item.id,
          type: 'RECEIVABLE_DUE',
          message: `Recebível próximo do vencimento: ${item.description}`,
          dueDate: item.dueDate.toISOString(),
          value: Number(item.value),
        })),
      ...overdueReceivables.map((item) => ({
        id: item.id,
        type: 'RECEIVABLE_OVERDUE',
        message: `Recebível em atraso: ${item.description}`,
        dueDate: item.dueDate.toISOString(),
        value: Number(item.value),
      })),
      ...payablesOpen
        .filter((item) => item.dueDate >= todayStart && item.dueDate <= dueSoonEnd)
        .map((item) => ({
          id: item.id,
          type: 'PAYABLE_DUE',
          message: `Pagamento próximo do vencimento: ${item.description}`,
          dueDate: item.dueDate.toISOString(),
          value: Number(item.value),
        })),
      ...overduePayables.map((item) => ({
        id: item.id,
        type: 'PAYABLE_OVERDUE',
        message: `Pagamento em atraso: ${item.description}`,
        dueDate: item.dueDate.toISOString(),
        value: Number(item.value),
      })),
    ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const profitabilityByCustomer = new Map<string, { customer: string; revenue: number; cost: number }>();
    const profitabilityByProduct = new Map<string, { product: string; revenue: number; cost: number; quantity: number }>();

    for (const sale of salesRange) {
      const customerName = sale.customer?.name ?? 'Consumidor final';
      const currentCustomer = profitabilityByCustomer.get(customerName) ?? { customer: customerName, revenue: 0, cost: 0 };
      currentCustomer.revenue += Number(sale.total);
      for (const item of sale.items) {
        const lineRevenue = Number(item.total);
        const lineCost = Number(item.costPrice) * item.quantity;
        currentCustomer.cost += lineCost;
        const productName = item.product.commercialName;
        const currentProduct = profitabilityByProduct.get(productName) ?? { product: productName, revenue: 0, cost: 0, quantity: 0 };
        currentProduct.revenue += lineRevenue;
        currentProduct.cost += lineCost;
        currentProduct.quantity += item.quantity;
        profitabilityByProduct.set(productName, currentProduct);
      }
      profitabilityByCustomer.set(customerName, currentCustomer);
    }

    const customerProfitRows = Array.from(profitabilityByCustomer.values())
      .map((item) => ({
        ...item,
        margin: Number((item.revenue - item.cost).toFixed(2)),
        marginPercent: item.revenue > 0 ? Number((((item.revenue - item.cost) / item.revenue) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.margin - a.margin);

    const productProfitRows = Array.from(profitabilityByProduct.values())
      .map((item) => ({
        ...item,
        margin: Number((item.revenue - item.cost).toFixed(2)),
        marginPercent: item.revenue > 0 ? Number((((item.revenue - item.cost) / item.revenue) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.margin - a.margin);

    const userMap = new Map(users.map((user) => [user.id, user.name || user.id]));
    const commissionBySeller = new Map<string, { sellerId: string; seller: string; gross: number }>();
    for (const receivable of paidReceivablesRange) {
      if (!receivable.saleId) continue;
      const sale = salesRange.find((item) => item.id === receivable.saleId);
      if (!sale?.createdBy) continue;
      const sellerId = sale.createdBy;
      const current = commissionBySeller.get(sellerId) ?? {
        sellerId,
        seller: userMap.get(sellerId) ?? sellerId,
        gross: 0,
      };
      current.gross += Number(receivable.netValue ?? receivable.value);
      commissionBySeller.set(sellerId, current);
    }
    const commissionRows = Array.from(commissionBySeller.values())
      .map((item) => ({
        ...item,
        percent: commissionPercent,
        commission: Number(((item.gross * commissionPercent) / 100).toFixed(2)),
      }))
      .sort((a, b) => b.commission - a.commission);

    const budgetRevenue = parsed.budgetRevenue ?? 0;
    const budgetExpense = parsed.budgetExpense ?? 0;
    const budgetComparison = {
      budgetRevenue,
      budgetExpense,
      actualRevenue: Number(totalRevenue.toFixed(2)),
      actualExpense: Number(totalExpense.toFixed(2)),
      revenueVariance: Number((totalRevenue - budgetRevenue).toFixed(2)),
      expenseVariance: Number((totalExpense - budgetExpense).toFixed(2)),
    };

    const reportType = parsed.reportType ?? 'receivables';
    let reportRows: Array<Record<string, string | number>> = [];
    if (reportType === 'receivables') {
      reportRows = receivablesRange.map((item) => ({
        id: item.id,
        descricao: item.description,
        vencimento: item.dueDate.toISOString().slice(0, 10),
        cliente: item.customer?.name ?? 'Consumidor final',
        status: item.status,
        valor: Number(item.value),
      }));
    } else if (reportType === 'payables') {
      reportRows = payablesRange.map((item) => ({
        id: item.id,
        descricao: item.description,
        vencimento: item.dueDate.toISOString().slice(0, 10),
        fornecedor: item.supplier?.name ?? '-',
        status: item.status,
        valor: Number(item.value),
      }));
    } else if (reportType === 'cash_movements') {
      reportRows = cashMovementsRange.map((item) => ({
        id: item.id,
        data: item.date.toISOString().slice(0, 10),
        tipo: item.type,
        descricao: item.description ?? '',
        valor: Number(item.value),
      }));
    } else if (reportType === 'profitability_customer') {
      reportRows = customerProfitRows.map((item, index) => ({
        ranking: index + 1,
        cliente: item.customer,
        receita: item.revenue,
        custo: item.cost,
        margem: item.margin,
        margemPercentual: item.marginPercent,
      }));
    } else {
      reportRows = productProfitRows.map((item, index) => ({
        ranking: index + 1,
        produto: item.product,
        quantidade: item.quantity,
        receita: item.revenue,
        custo: item.cost,
        margem: item.margin,
        margemPercentual: item.marginPercent,
      }));
    }

    const selectedColumns = parsed.columns?.split(',').filter(Boolean);
    const normalizedReportRows = selectedColumns && selectedColumns.length > 0
      ? reportRows.map((row) =>
          Object.fromEntries(
            Object.entries(row).filter(([key]) => selectedColumns.includes(key))
          )
        )
      : reportRows;

    return successResponse({
      realtime: {
        revenue: Number(totalRevenue.toFixed(2)),
        expense: Number(totalExpense.toFixed(2)),
        currentBalance: Number(currentBalance.toFixed(2)),
        receivableOpenValue: Number(receivableOpenValue.toFixed(2)),
        payableOpenValue: Number(payableOpenValue.toFixed(2)),
        overdueReceivableCount: overdueReceivables.length,
        overduePayableCount: overduePayables.length,
      },
      forecast,
      trends: months,
      alerts: alertItems,
      aging: {
        receivables: receivableAging,
        payables: payableAging,
      },
      profitability: {
        customers: customerProfitRows,
        products: productProfitRows,
      },
      commissions: commissionRows,
      budgetComparison,
      reports: {
        type: reportType,
        rows: normalizedReportRows,
      },
      cardSummary: {
        gross: paidCardReceivables.reduce((acc, item) => acc + Number(item.value), 0),
        fees: paidCardReceivables.reduce((acc, item) => acc + Number(item.cardFeeValue ?? 0), 0),
        net: paidCardReceivables.reduce((acc, item) => acc + Number(item.netValue ?? item.value), 0),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
