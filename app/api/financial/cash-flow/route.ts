import { NextRequest } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { FinancialService } from '@/lib/services/financial';
import { ensureDailyCashOpen } from '@/lib/services/daily-cash';

type RowStatus = 'CONFIRMADO' | 'PENDENTE' | 'ATRASADO';

const periodSchema = z.enum(['today', '7d', '30d', 'month', 'custom']).optional();

const statusFrom = (status: PaymentStatus, dueDate: Date): RowStatus => {
  if (status === 'PAID') return 'CONFIRMADO';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today ? 'ATRASADO' : 'PENDENTE';
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseListParam = (value: string | null) => {
  if (!value) return [] as string[];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const resolveDateRange = (period: z.infer<typeof periodSchema>, from: string | null, to: string | null) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (period === '7d') {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (period === '30d') {
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (period === 'custom' && from && to) {
    const customStart = new Date(from);
    const customEnd = new Date(to);
    customStart.setHours(0, 0, 0, 0);
    customEnd.setHours(23, 59, 59, 999);
    return { start: customStart, end: customEnd };
  }
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  monthStart.setHours(0, 0, 0, 0);
  monthEnd.setHours(23, 59, 59, 999);
  return { start: monthStart, end: monthEnd };
};

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const period = periodSchema.parse(searchParams.get('period') ?? '30d');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const hideReconciled = searchParams.get('hideReconciled') === '1';
    const accountFilter = parseListParam(searchParams.get('accounts'));
    const categoryFilter = parseListParam(searchParams.get('categories'));
    const { start, end } = resolveDateRange(period, from, to);

    const [receivables, payables, paidIn, paidOut, openingPaidIn, openingPaidOut, fixedCosts90, commissionProvisions] = await Promise.all([
      prisma.receivable.findMany({
        where: {
          dueDate: { gte: start, lte: end },
        },
        include: {
          costCenter: true,
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.payable.findMany({
        where: {
          dueDate: { gte: start, lte: end },
        },
        include: {
          costCenter: true,
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.receivable.aggregate({
        where: { status: 'PAID' },
        _sum: { netValue: true, value: true },
      }),
      prisma.payable.aggregate({
        where: { status: 'PAID' },
        _sum: { value: true },
      }),
      prisma.receivable.aggregate({
        where: { status: 'PAID', dueDate: { lt: start } },
        _sum: { netValue: true, value: true },
      }),
      prisma.payable.aggregate({
        where: { status: 'PAID', dueDate: { lt: start } },
        _sum: { value: true },
      }),
      prisma.payable.aggregate({
        where: {
          status: 'PAID',
          dueDate: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90) },
        },
        _sum: { value: true },
      }),
      prisma.serviceCommissionProvision.findMany({
        where: {
          status: 'PROVISIONED',
          competenceYear: {
            gte: start.getFullYear(),
            lte: end.getFullYear(),
          },
        },
      }),
    ]);

    const baseRows = [
      ...receivables.map((item) => {
        const status = statusFrom(item.status, item.dueDate);
        return {
          id: item.id,
          source: 'RECEIVABLE' as const,
          origin: item.origin,
          date: item.dueDate.toISOString(),
          description: item.description,
          category: item.costCenter?.name ?? 'Vendas',
          account: item.paymentMethod ?? 'Contas a Receber',
          value: Number(item.netValue ?? item.value),
          direction: 'IN' as const,
          status,
          reconciled: status === 'CONFIRMADO',
        };
      }),
      ...payables.map((item) => {
        const status = statusFrom(item.status, item.dueDate);
        return {
          id: item.id,
          source: 'PAYABLE' as const,
          origin: 'PAYABLE',
          date: item.dueDate.toISOString(),
          description: item.description,
          category: item.costCenter?.name ?? 'Administrativo',
          account: item.status === 'PAID' ? 'Caixa/Banco' : 'Contas a Pagar',
          value: Number(item.value),
          direction: 'OUT' as const,
          status,
          reconciled: status === 'CONFIRMADO',
        };
      }),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const accountOptions = Array.from(new Set(baseRows.map((row) => row.account))).sort((a, b) => a.localeCompare(b));
    const categoryOptions = Array.from(new Set(baseRows.map((row) => row.category))).sort((a, b) => a.localeCompare(b));

    const rows = baseRows.filter((row) => {
      if (hideReconciled && row.reconciled) return false;
      if (accountFilter.length > 0 && !accountFilter.includes(row.account)) return false;
      if (categoryFilter.length > 0 && !categoryFilter.includes(row.category)) return false;
      return true;
    });

    const projectedCommissionByDate = new Map<string, number>();
    for (const provision of commissionProvisions) {
      const projectedDate = new Date(
        provision.competenceYear,
        provision.competenceMonth,
        0,
        23,
        59,
        59,
        999
      );
      if (projectedDate < start || projectedDate > end) continue;
      const key = toDateKey(projectedDate);
      projectedCommissionByDate.set(
        key,
        (projectedCommissionByDate.get(key) ?? 0) + Number(provision.commissionAmount)
      );
    }

    const startKey = toDateKey(start);
    const endKey = toDateKey(end);
    const rowByDate = new Map<string, { entry: number; exit: number }>();
    for (const row of rows) {
      const key = toDateKey(new Date(row.date));
      const current = rowByDate.get(key) ?? { entry: 0, exit: 0 };
      if (row.direction === 'IN') current.entry += row.value;
      if (row.direction === 'OUT') current.exit += row.value;
      rowByDate.set(key, current);
    }

    const openingBalance =
      Number(openingPaidIn._sum.netValue ?? openingPaidIn._sum.value ?? 0) -
      Number(openingPaidOut._sum.value ?? 0);

    const series: Array<{
      date: string;
      entry: number;
      exit: number;
      commissionProjectedOut: number;
      accumulated: number;
      accumulatedWithCommission: number;
    }> = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    let accumulated = openingBalance;
    while (toDateKey(cursor) <= endKey) {
      const key = toDateKey(cursor);
      const daily = rowByDate.get(key) ?? { entry: 0, exit: 0 };
      const commissionProjectedOut = Number((projectedCommissionByDate.get(key) ?? 0).toFixed(2));
      accumulated += daily.entry - daily.exit;
      series.push({
        date: key,
        entry: daily.entry,
        exit: daily.exit,
        commissionProjectedOut,
        accumulated,
        accumulatedWithCommission: Number((accumulated - commissionProjectedOut).toFixed(2)),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const totalEntradas = rows.filter((row) => row.direction === 'IN').reduce((acc, row) => acc + row.value, 0);
    const totalSaidas = rows.filter((row) => row.direction === 'OUT').reduce((acc, row) => acc + row.value, 0);
    const resultadoLiquido = totalEntradas - totalSaidas;
    const saldoAtual = Number(paidIn._sum.netValue ?? paidIn._sum.value ?? 0) - Number(paidOut._sum.value ?? 0);
    const comissaoProjetadaPeriodo = Number(
      Array.from(projectedCommissionByDate.values()).reduce((acc, value) => acc + value, 0).toFixed(2)
    );
    const saldoProjetadoComComissao = Number((resultadoLiquido - comissaoProjetadaPeriodo).toFixed(2));

    const monthlyFixedCosts = Number(fixedCosts90._sum.value ?? 0) / 3;
    const reserveTarget = Math.max(monthlyFixedCosts * 6, 1);
    const reserveCoverageMonths = monthlyFixedCosts > 0 ? saldoAtual / monthlyFixedCosts : 0;

    return successResponse({
      period: {
        start: startKey,
        end: endKey,
      },
      kpis: {
        saldoAtual,
        totalEntradas,
        totalSaidas,
        resultadoLiquido,
        comissaoProjetadaPeriodo,
        saldoProjetadoComComissao,
      },
      reserve: {
        currentBalance: saldoAtual,
        targetBalance: reserveTarget,
        coverageMonths: reserveCoverageMonths,
      },
      chart: series,
      rows,
      options: {
        accounts: accountOptions,
        categories: categoryOptions,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

const createSchema = z.object({
  action: z.literal('create'),
  type: z.enum(['IN', 'OUT']),
  description: z.string().min(3),
  date: z.string(),
  value: z.number().positive(),
  category: z.string().min(2),
  status: z.enum(['PENDENTE', 'CONFIRMADO']),
});

const conciliateSchema = z.object({
  action: z.literal('conciliate'),
  source: z.enum(['RECEIVABLE', 'PAYABLE']),
  id: z.string().min(1),
});

const updateSchema = z.object({
  action: z.literal('update'),
  source: z.enum(['RECEIVABLE', 'PAYABLE']),
  id: z.string().min(1),
  description: z.string().min(3),
  date: z.string(),
  value: z.number().positive(),
  category: z.string().min(2),
});

const deleteSchema = z.object({
  action: z.literal('delete'),
  source: z.enum(['RECEIVABLE', 'PAYABLE']),
  id: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { authorized, response, session } = await checkAuth();
    if (!authorized) return response;
    const userId = session?.user?.id;
    if (!userId) return errorResponse(new Error('Unauthorized'), 401);

    const body = await req.json();
    if (body?.action === 'create') {
      const parsed = createSchema.parse(body);
      if (parsed.type === 'IN') {
        let costCenter = await prisma.costCenter.findFirst({
          where: { type: 'REVENUE', name: { equals: parsed.category, mode: 'insensitive' } },
        });
        if (!costCenter) {
          costCenter = await prisma.costCenter.create({
            data: { name: parsed.category, type: 'REVENUE', active: true },
          });
        }
        const receivable = await prisma.receivable.create({
          data: {
            description: parsed.description,
            dueDate: new Date(parsed.date),
            value: parsed.value,
            origin: 'MANUAL',
            status: 'PENDING',
            costCenterId: costCenter.id,
          },
        });
        if (parsed.status === 'CONFIRMADO') {
          await ensureDailyCashOpen();
          await FinancialService.registerPayment({
            receivableId: receivable.id,
            paymentMethod: 'DINHEIRO',
            paidValue: parsed.value,
            userId,
            paidAt: new Date(parsed.date),
          });
        }
      }
      if (parsed.type === 'OUT') {
        let costCenter = await prisma.costCenter.findFirst({
          where: { type: 'EXPENSE', name: { equals: parsed.category, mode: 'insensitive' } },
        });
        if (!costCenter) {
          costCenter = await prisma.costCenter.create({
            data: { name: parsed.category, type: 'EXPENSE', active: true },
          });
        }
        const payable = await prisma.payable.create({
          data: {
            description: parsed.description,
            dueDate: new Date(parsed.date),
            value: parsed.value,
            status: 'PENDING',
            costCenterId: costCenter.id,
          },
        });
        if (parsed.status === 'CONFIRMADO') {
          await ensureDailyCashOpen();
          await prisma.$transaction(async (tx) => {
            await tx.payable.update({
              where: { id: payable.id },
              data: { status: 'PAID' },
            });
            await tx.cashMovement.create({
              data: {
                type: 'OUT',
                value: parsed.value,
                description: `Pagamento: ${parsed.description}`,
                payableId: payable.id,
                userId,
                date: new Date(parsed.date),
              },
            });
          });
        }
      }
      return successResponse({ success: true });
    }

    if (body?.action === 'conciliate') {
      const parsed = conciliateSchema.parse(body);
      await ensureDailyCashOpen();
      if (parsed.source === 'RECEIVABLE') {
        const receivable = await prisma.receivable.findUnique({ where: { id: parsed.id } });
        if (!receivable) throw new Error('Lançamento não encontrado');
        if (receivable.status !== 'PAID') {
          await FinancialService.registerPayment({
            receivableId: receivable.id,
            paymentMethod: 'DINHEIRO',
            paidValue: Number(receivable.value),
            userId,
          });
        }
      }
      if (parsed.source === 'PAYABLE') {
        const payable = await prisma.payable.findUnique({ where: { id: parsed.id } });
        if (!payable) throw new Error('Lançamento não encontrado');
        if (payable.status !== 'PAID') {
          await prisma.$transaction(async (tx) => {
            await tx.payable.update({
              where: { id: payable.id },
              data: { status: 'PAID' },
            });
            await tx.cashMovement.create({
              data: {
                type: 'OUT',
                value: payable.value,
                description: `Pagamento: ${payable.description}`,
                payableId: payable.id,
                userId,
                date: new Date(),
              },
            });
          });
        }
      }
      return successResponse({ success: true });
    }

    if (body?.action === 'update') {
      const parsed = updateSchema.parse(body);
      if (parsed.source === 'RECEIVABLE') {
        const target = await prisma.receivable.findUnique({ where: { id: parsed.id } });
        if (!target) throw new Error('Lançamento não encontrado');
        if (target.status === 'PAID') throw new Error('Lançamento conciliado não pode ser editado');
        const costCenter = await prisma.costCenter.findFirst({
          where: { type: 'REVENUE', name: { equals: parsed.category, mode: 'insensitive' } },
        });
        await prisma.receivable.update({
          where: { id: parsed.id },
          data: {
            description: parsed.description,
            dueDate: new Date(parsed.date),
            value: parsed.value,
            costCenterId: costCenter?.id,
          },
        });
      }
      if (parsed.source === 'PAYABLE') {
        const target = await prisma.payable.findUnique({ where: { id: parsed.id } });
        if (!target) throw new Error('Lançamento não encontrado');
        if (target.status === 'PAID') throw new Error('Lançamento conciliado não pode ser editado');
        const costCenter = await prisma.costCenter.findFirst({
          where: { type: 'EXPENSE', name: { equals: parsed.category, mode: 'insensitive' } },
        });
        await prisma.payable.update({
          where: { id: parsed.id },
          data: {
            description: parsed.description,
            dueDate: new Date(parsed.date),
            value: parsed.value,
            costCenterId: costCenter?.id,
          },
        });
      }
      return successResponse({ success: true });
    }

    if (body?.action === 'delete') {
      const parsed = deleteSchema.parse(body);
      if (parsed.source === 'RECEIVABLE') {
        const target = await prisma.receivable.findUnique({ where: { id: parsed.id } });
        if (!target) throw new Error('Lançamento não encontrado');
        if (target.status === 'PAID') throw new Error('Lançamento conciliado não pode ser removido');
        await prisma.receivable.delete({ where: { id: parsed.id } });
      }
      if (parsed.source === 'PAYABLE') {
        const target = await prisma.payable.findUnique({ where: { id: parsed.id } });
        if (!target) throw new Error('Lançamento não encontrado');
        if (target.status === 'PAID') throw new Error('Lançamento conciliado não pode ser removido');
        await prisma.payable.delete({ where: { id: parsed.id } });
      }
      return successResponse({ success: true });
    }

    return errorResponse(new Error('Ação inválida'), 400);
  } catch (error) {
    return errorResponse(error);
  }
}
