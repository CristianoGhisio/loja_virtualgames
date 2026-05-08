import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { StockService } from '@/lib/services/stock';

const createReturnSchema = z.object({
  saleId: z.string(),
  customerId: z.string().optional(),
  reason: z.string().min(3),
  notes: z.string().optional(),
  type: z.enum(['RETURN', 'EXCHANGE']).default('RETURN'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    reason: z.string().optional(),
  })).min(1),
});

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const returns = await prisma.$queryRaw<Array<{
      id: string;
      saleId: string;
      reason: string;
      status: string;
      type: string;
      createdAt: Date;
      customerId: string | null;
      customerName: string | null;
    }>>(Prisma.sql`
      SELECT
        sr."id",
        sr."saleId",
        sr."reason",
        sr."status"::text as "status",
        sr."type"::text as "type",
        sr."createdAt",
        sr."customerId",
        c."name" as "customerName"
      FROM "SaleReturn" sr
      LEFT JOIN "Customer" c ON c."id" = sr."customerId"
      ORDER BY sr."createdAt" DESC
    `);

    return successResponse(returns);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;

    const payload = createReturnSchema.parse(await request.json());

    const created = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: payload.saleId },
        include: {
          items: true,
        },
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      const saleItemsByProduct = new Map(
        sale.items.map((item) => [item.productId, item])
      );

      const existingReturns = await tx.$queryRaw<Array<{
        productId: string;
        quantity: number;
      }>>(Prisma.sql`
        SELECT sri."productId", sri."quantity"
        FROM "SaleReturnItem" sri
        INNER JOIN "SaleReturn" sr ON sr."id" = sri."saleReturnId"
        WHERE sr."saleId" = ${payload.saleId}
          AND sr."status"::text <> 'REJECTED'
          AND sri."productId" IN (${Prisma.join(payload.items.map((item) => item.productId))})
      `);

      const alreadyReturnedByProduct = new Map<string, number>();
      for (const returnItem of existingReturns) {
        alreadyReturnedByProduct.set(
          returnItem.productId,
          (alreadyReturnedByProduct.get(returnItem.productId) ?? 0) + returnItem.quantity
        );
      }

      for (const item of payload.items) {
        const originalSaleItem = saleItemsByProduct.get(item.productId);
        if (!originalSaleItem) {
          throw new Error(`Product ${item.productId} does not belong to sale`);
        }

        const alreadyReturned = alreadyReturnedByProduct.get(item.productId) ?? 0;
        const availableToReturn = originalSaleItem.quantity - alreadyReturned;

        if (item.quantity > availableToReturn) {
          throw new Error(
            `Return quantity exceeds sold quantity for product ${item.productId}`
          );
        }
      }

      const saleReturnId = crypto.randomUUID();

      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "SaleReturn"
          ("id", "saleId", "customerId", "reason", "notes", "status", "type", "createdAt", "updatedAt", "createdBy")
        VALUES
          (${saleReturnId}, ${payload.saleId}, ${payload.customerId ?? sale.customerId}, ${payload.reason}, ${payload.notes ?? null}, 'COMPLETED', ${payload.type}::"ReturnType", NOW(), NOW(), ${user?.id ?? null})
      `);

      for (const item of payload.items) {
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "SaleReturnItem"
            ("id", "saleReturnId", "productId", "quantity", "unitPrice", "reason")
          VALUES
            (${crypto.randomUUID()}, ${saleReturnId}, ${item.productId}, ${item.quantity}, ${item.unitPrice}, ${item.reason ?? null})
        `);
      }

      for (const item of payload.items) {
        await StockService.moveStock(
          item.productId,
          item.quantity,
          'IN_RETURN',
          `Devolução #${saleReturnId}`,
          saleReturnId,
          user?.id,
          tx
        );
      }

      return {
        id: saleReturnId,
        saleId: payload.saleId,
        status: 'COMPLETED',
      };
    });

    return successResponse(created, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
