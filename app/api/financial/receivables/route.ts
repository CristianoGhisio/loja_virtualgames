import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { PaymentStatus, Prisma, ReceivableOrigin } from '@prisma/client';
import { FinancialService } from '@/lib/services/financial';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const origin = searchParams.get('origin');
    const paymentMethod = searchParams.get('paymentMethod');
    const period = searchParams.get('period');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const skip = (page - 1) * limit;

    const where: Prisma.ReceivableWhereInput = {};

    if (status === 'OVERDUE') {
      where.status = { not: 'PAID' };
      where.dueDate = { lt: new Date() };
    } else if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      where.status = status as PaymentStatus;
    }

    if (origin && Object.values(ReceivableOrigin).includes(origin as ReceivableOrigin)) {
      where.origin = origin as ReceivableOrigin;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (query) {
      where.OR = [
        { description: { contains: query, mode: 'insensitive' } },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (category) {
      where.costCenter = { name: { contains: category, mode: 'insensitive' } };
    }

    if (period === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    } else if (period === '7d' || period === '30d') {
      const days = period === '7d' ? 7 : 30;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() + days);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    } else if (period === 'custom' && from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    }

    const [total, receivables] = await Promise.all([
      prisma.receivable.count({ where }),
      prisma.receivable.findMany({
        where,
        skip,
        take: limit,
        include: { customer: true, sale: true, serviceOrder: true, costCenter: true },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    const serviceOrderIds = receivables
      .map((receivable) => receivable.serviceOrderId)
      .filter((item): item is string => Boolean(item));
    const commissions = serviceOrderIds.length > 0
      ? await prisma.serviceCommissionProvision.groupBy({
          by: ['serviceOrderId'],
          where: {
            serviceOrderId: { in: serviceOrderIds },
            status: { in: ['PROVISIONED', 'PAID'] },
          },
          _sum: {
            commissionAmount: true,
          },
        })
      : [];
    const commissionByServiceOrder = new Map(
      commissions.map((item) => [item.serviceOrderId, Number(item._sum.commissionAmount ?? 0)])
    );

    const enriched = receivables.map((receivable) => {
      const grossValue = Number(receivable.value);
      const netValue = Number(receivable.netValue ?? receivable.value);
      const commissionValue =
        receivable.origin === 'SERVICE'
          ? Number((commissionByServiceOrder.get(receivable.serviceOrderId ?? '') ?? 0).toFixed(2))
          : 0;
      return {
      ...receivable,
      origin: receivable.origin,
      grossValue: Number(grossValue.toFixed(2)),
      commissionValue,
      netValue: Number(netValue.toFixed(2)),
      computedStatus:
        receivable.status === 'PAID'
          ? 'PAID'
          : new Date(receivable.dueDate) < new Date()
            ? 'OVERDUE'
            : 'PENDING',
      };
    });

    return successResponse({
      data: enriched,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, session, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const userId = session?.user?.id;
    if (!userId) {
      return errorResponse(new Error('Unauthorized'), 401);
    }

    const action = body.action as string | undefined;

    if (action === 'create') {
      const schema = z.object({
        action: z.literal('create'),
        description: z.string().min(3),
        customerId: z.string().optional(),
        dueDate: z.string().optional(),
        value: z.number().positive(),
        category: z.string().optional(),
        paymentMethod: z.enum(['PIX', 'DINHEIRO', 'CARTAO', 'CREDITO_LOJA', 'CREDITO', 'DEBITO']).optional(),
        cardFeePercent: z.number().min(0).max(100).optional(),
        paidAt: z.string().optional(),
        origin: z.enum(['MANUAL', 'SALE', 'SERVICE']).optional(),
      });
      const parsed = schema.parse(body);

      let costCenterId: string | undefined;
      if (parsed.category?.trim()) {
        const categoryName = parsed.category.trim();
        const existing = await prisma.costCenter.findFirst({
          where: {
            type: 'REVENUE',
            name: { equals: categoryName, mode: 'insensitive' },
          },
        });
        if (existing) {
          costCenterId = existing.id;
        } else {
          const created = await prisma.costCenter.create({
            data: { name: categoryName, type: 'REVENUE', active: true },
          });
          costCenterId = created.id;
        }
      } else {
        const revenueCostCenter = await prisma.costCenter.findFirst({
          where: { type: 'REVENUE' },
        });
        costCenterId = revenueCostCenter?.id;
      }

      const receivable = await prisma.receivable.create({
        data: {
          description: parsed.description,
          dueDate: parsed.dueDate ? new Date(parsed.dueDate) : new Date(),
          value: parsed.value,
          origin: parsed.origin ?? 'MANUAL',
          status: 'PENDING',
          customerId: parsed.customerId || undefined,
          costCenterId,
        },
      });

      if (parsed.paymentMethod) {
        await FinancialService.registerPayment({
          receivableId: receivable.id,
          paymentMethod: parsed.paymentMethod,
          cardFeePercent: parsed.cardFeePercent,
          paidValue: parsed.value,
          userId,
          paidAt: parsed.paidAt ? new Date(parsed.paidAt) : new Date(),
        });
      }
      return successResponse({ success: true });
    }

    if (action === 'batch_receive') {
      const schema = z.object({
        action: z.literal('batch_receive'),
        ids: z.array(z.string()).min(1),
        paymentMethod: z.enum(['PIX', 'DINHEIRO', 'CARTAO', 'CREDITO_LOJA', 'CREDITO', 'DEBITO']),
        cardFeePercent: z.number().min(0).max(100).optional(),
      });
      const parsed = schema.parse(body);

      for (const id of parsed.ids) {
        const receivable = await prisma.receivable.findUnique({ where: { id } });
        if (!receivable || receivable.status === 'PAID' || receivable.status === 'CANCELLED') continue;

        await FinancialService.registerPayment({
          receivableId: id,
          paymentMethod: parsed.paymentMethod,
          cardFeePercent: parsed.cardFeePercent,
          paidValue: Number(receivable.value),
          userId,
        });
      }
      return successResponse({ success: true });
    }

    const schema = z.object({
      id: z.string(),
      paymentMethod: z.enum(['PIX', 'DINHEIRO', 'CARTAO', 'CREDITO_LOJA', 'CREDITO', 'DEBITO']),
      paidValue: z.number().positive().optional(),
      cardFeePercent: z.number().min(0).max(100).optional(),
      paidAt: z.string().optional(),
    });
    const parsed = schema.parse(body);

    await FinancialService.registerPayment({
      receivableId: parsed.id,
      paymentMethod: parsed.paymentMethod,
      cardFeePercent: parsed.cardFeePercent,
      paidValue: parsed.paidValue,
      userId,
      paidAt: parsed.paidAt ? new Date(parsed.paidAt) : undefined,
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
