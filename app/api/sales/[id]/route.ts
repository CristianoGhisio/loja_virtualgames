import { NextRequest } from 'next/server';
import { Prisma, SaleStatus } from '@prisma/client';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { StockService } from '@/lib/services/stock';


export const dynamic = 'force-dynamic';

async function cancelSale(saleId: string, userId?: string) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: {
        items: true,
      },
    });

    if (!sale) {
      throw new Error('Sale not found');
    }

    if (sale.status === SaleStatus.CANCELLED) {
      return sale;
    }

    if (sale.status === SaleStatus.COMPLETED) {
      for (const item of sale.items) {
        await StockService.moveStock(
          item.productId,
          item.quantity,
          'IN_RETURN',
          `Cancelamento da venda #${sale.id}`,
          sale.id,
          userId,
          tx
        );
      }
    }

    const updatedSale = await tx.sale.update({
      where: { id: sale.id },
      data: {
        status: SaleStatus.CANCELLED,
      },
    });

    await tx.receivable.updateMany({
      where: { saleId: sale.id },
      data: { status: 'CANCELLED' },
    });

    await tx.auditLog.create({
      data: {
        action: 'CANCEL_SALE',
        module: 'SALES',
        entity: 'Sale',
        entityId: sale.id,
        userId,
        newValue: JSON.stringify({ status: SaleStatus.CANCELLED }),
      },
    });

    return updatedSale;
  });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await context.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                commercialName: true,
              },
            },
          },
        },
        receivable: true,
      },
    });

    if (!sale) {
      throw new Error('Sale not found');
    }

    const returns = await prisma.$queryRaw<Array<{
      id: string;
      reason: string;
      type: string;
      status: string;
      createdAt: Date;
    }>>(Prisma.sql`
      SELECT
        sr."id",
        sr."reason",
        sr."type"::text as "type",
        sr."status"::text as "status",
        sr."createdAt"
      FROM "SaleReturn" sr
      WHERE sr."saleId" = ${id}
      ORDER BY sr."createdAt" DESC
    `);

    return successResponse({
      ...sale,
      returns,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));

    if (body.status !== SaleStatus.CANCELLED) {
      throw new Error('Only status CANCELLED is supported on this endpoint');
    }

    const sale = await cancelSale(id, user?.id);
    return successResponse(sale);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;

    const { id } = await context.params;
    const sale = await cancelSale(id, user?.id);

    return successResponse(sale);
  } catch (error) {
    return errorResponse(error);
  }
}
