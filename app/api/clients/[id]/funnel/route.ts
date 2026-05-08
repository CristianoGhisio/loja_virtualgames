import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const rows = await prisma.$queryRaw<Array<{
      stage: string;
      active: boolean;
      updatedAt: Date;
    }>>(Prisma.sql`
      SELECT
        cfc."stage"::text as "stage",
        cfc."active",
        cfc."updatedAt"
      FROM "CustomerFunnelCard" cfc
      WHERE cfc."customerId" = ${id}
      ORDER BY cfc."active" DESC, cfc."updatedAt" DESC
      LIMIT 1
    `);

    if (!rows[0]) {
      return NextResponse.json(null);
    }

    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch funnel stage' }, { status: 500 });
  }
}
