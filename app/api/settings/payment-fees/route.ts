import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { getPaymentFeeConfig } from '@/lib/services/payment-fees';


export const dynamic = 'force-dynamic';

const paymentFeesSchema = z.object({
  creditFixedFee: z.number().min(0),
  creditVariableFee: z.number().min(0),
  debitFixedFee: z.number().min(0),
  debitVariableFee: z.number().min(0),
});

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const config = await getPaymentFeeConfig(prisma);
    return successResponse(config);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const parsed = paymentFeesSchema.parse(body);

    await prisma.$executeRaw(Prisma.sql`
      CREATE TABLE IF NOT EXISTS "PaymentFeeSettings" (
        "id" TEXT NOT NULL,
        "creditFixedFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "creditVariableFee" DECIMAL(5,2) NOT NULL DEFAULT 0,
        "debitFixedFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "debitVariableFee" DECIMAL(5,2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "PaymentFeeSettings_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id"
        FROM "PaymentFeeSettings"
        ORDER BY "updatedAt" DESC
        LIMIT 1
      `);

      if (existing[0]?.id) {
        await tx.$executeRaw(Prisma.sql`
          UPDATE "PaymentFeeSettings"
          SET
            "creditFixedFee" = ${parsed.creditFixedFee},
            "creditVariableFee" = ${parsed.creditVariableFee},
            "debitFixedFee" = ${parsed.debitFixedFee},
            "debitVariableFee" = ${parsed.debitVariableFee},
            "updatedAt" = NOW()
          WHERE "id" = ${existing[0].id}
        `);
      } else {
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "PaymentFeeSettings"
            ("id", "creditFixedFee", "creditVariableFee", "debitFixedFee", "debitVariableFee", "createdAt", "updatedAt")
          VALUES
            (${crypto.randomUUID()}, ${parsed.creditFixedFee}, ${parsed.creditVariableFee}, ${parsed.debitFixedFee}, ${parsed.debitVariableFee}, NOW(), NOW())
        `);
      }
    });

    const config = await getPaymentFeeConfig(prisma);
    return successResponse(config);
  } catch (error) {
    return errorResponse(error);
  }
}
