import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const weekOffset = (now.getDay() + 6) % 7;
    const weekStart = new Date(dayStart);
    weekStart.setDate(dayStart.getDate() - weekOffset);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    const [serviceOrders, sales, pendingContacts, dailyRevenue, weeklyRevenue, monthlyRevenue, monthlyExpenses, pendingReceivables] = await Promise.all([
      prisma.serviceOrder.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.sale.findMany({
        take: 6,
        where: {
          status: {
            not: 'CANCELLED',
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.customerFunnelCard.findMany({
        where: {
          stage: 'NOVO_CONTATO',
          active: true,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.receivable.aggregate({
        _sum: { netValue: true, value: true },
        where: {
          status: 'PAID',
          paidAt: { gte: dayStart, lte: now },
        },
      }),
      prisma.receivable.aggregate({
        _sum: { netValue: true, value: true },
        where: {
          status: 'PAID',
          paidAt: { gte: weekStart, lte: now },
        },
      }),
      prisma.receivable.aggregate({
        _sum: { netValue: true, value: true },
        where: {
          status: 'PAID',
          paidAt: { gte: monthStart, lte: now },
        },
      }),
      prisma.payable.aggregate({
        _sum: { value: true },
        where: {
          status: 'PAID',
          updatedAt: { gte: monthStart, lte: now },
        },
      }),
      prisma.receivable.aggregate({
        _sum: { value: true },
        _count: { _all: true },
        where: {
          status: { in: ['PENDING', 'OVERDUE'] },
        },
      }),
    ]);

    const dailyRevenueValue = Number(dailyRevenue._sum.netValue ?? dailyRevenue._sum.value ?? 0);
    const weeklyRevenueValue = Number(weeklyRevenue._sum.netValue ?? weeklyRevenue._sum.value ?? 0);
    const monthlyRevenueValue = Number(monthlyRevenue._sum.netValue ?? monthlyRevenue._sum.value ?? 0);
    const monthlyExpensesValue = Number(monthlyExpenses._sum.value ?? 0);
    const pendingReceivablesValue = Number(pendingReceivables._sum.value ?? 0);
    const pendingReceivablesCount = pendingReceivables._count._all;

    const data = {
      serviceOrders: serviceOrders.map((item) => ({
        id: item.id,
        device: item.device,
        status: item.status,
        customerName: item.customer.name,
        createdAt: item.createdAt.toISOString(),
      })),
      sales: sales.map((item) => ({
        id: item.id,
        total: Number(item.total),
        paymentMethod: item.paymentMethod,
        status: item.status,
        customerName: item.customer?.name || 'Consumidor final',
        createdAt: item.createdAt.toISOString(),
      })),
      pendingContacts: {
        count: pendingContacts.length,
        items: pendingContacts.slice(0, 6).map((item) => ({
          id: item.id,
          customerName: item.customer.name,
          createdAt: item.createdAt.toISOString(),
          itemInterest: item.itemInterest,
        })),
      },
      financialSnapshot: {
        dailyRevenue: dailyRevenueValue,
        weeklyRevenue: weeklyRevenueValue,
        monthlyRevenue: monthlyRevenueValue,
        monthlyExpenses: monthlyExpensesValue,
        monthlyBalance: monthlyRevenueValue - monthlyExpensesValue,
        pendingReceivablesValue,
        pendingReceivablesCount,
        updatedAt: now.toISOString(),
      },
    };

    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
