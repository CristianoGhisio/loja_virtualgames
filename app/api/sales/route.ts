import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma, SaleStatus } from '@prisma/client';
import { checkAuth, hasApiPermission } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { SalesService } from '@/lib/services/sales';
import { prisma } from '@/lib/prisma';

const createSaleSchema = z.object({
  customerId: z.string().nullable().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
  paymentMethod: z.string(),
  discount: z.number().min(0).optional(),
  status: z.nativeEnum(SaleStatus).optional(),
  sourceCardId: z.string().optional().nullable(),
  sourceFlowKind: z.enum(['PRODUCT']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { authorized, session, response, user } = await checkAuth();
    if (!authorized) return response;
    if (!hasApiPermission(user, 'sales', 'create')) {
      return errorResponse(new Error('Permissão negada'), 403);
    }

    const body = await req.json();
    const parsed = createSaleSchema.parse(body);

    if (parsed.status === SaleStatus.COMPLETED && !parsed.customerId) {
      return errorResponse(new Error('Cliente é obrigatório para finalizar a venda'), 422);
    }

    const userId = session?.user?.id;
    if (!userId) {
      return errorResponse(new Error('Unauthorized'), 401);
    }

    const sale = await SalesService.createSale({
      ...parsed,
      customerId: parsed.customerId ?? undefined,
      sourceCardId: parsed.sourceCardId ?? undefined,
      userId,
    });

    return successResponse(sale, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const statusList = status
      ? status.split(',').map((value) => value.trim()).filter(Boolean)
      : [];

    const where: Prisma.SaleWhereInput = {};

    if (statusList.length > 0) {
      where.status = { in: statusList as SaleStatus[] };
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { document: { contains: search } } },
      ];
    }

    if (from || to) {
      where.date = {};
      if (from) {
        where.date.gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.date.lte = toDate;
      }
    }

    const [total, sales] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          _count: {
            select: { items: true },
          },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    return successResponse({
      data: sales,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return errorResponse(error);
  }
}
