import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma, StockMovementType } from '@prisma/client';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { StockService } from '@/lib/services/stock';
import { prisma } from '@/lib/prisma';

const movementSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  type: z.enum(['IN_PURCHASE', 'IN_RETURN', 'IN_ADJUSTMENT', 'OUT_LOSS', 'OUT_ADJUSTMENT', 'OUT_SALE', 'OUT_WARRANTY', 'OUT_SERVICE_PART']),
  reason: z.string().min(3),
  unitCost: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;

    const json = await req.json();
    const body = movementSchema.parse(json);

    const movement = await StockService.moveStock(
      body.productId,
      body.quantity,
      body.type,
      body.reason,
      undefined,
      user?.id,
      undefined,
      body.unitCost
    );

    return successResponse(movement, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const limit = Number(searchParams.get('limit')) || 50;

    const where: Prisma.StockMovementWhereInput = {};
    if (productId) where.productId = productId;
    if (type) where.type = type as StockMovementType;

    const movements = await prisma.stockMovement.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { id: true, commercialName: true }
        }
      }
    });

    return successResponse(movements);
  } catch (error) {
    return errorResponse(error);
  }
}


