import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    const [totalGranted, totalUsed, clientsWithCredit, topClients] = await Promise.all([
      prisma.customerCredit.aggregate({
        _sum: { amount: true },
        where: { type: 'CREDIT' },
      }),
      prisma.customerCredit.aggregate({
        _sum: { amount: true },
        where: { type: 'DEBIT' },
      }),
      prisma.customer.count({
        where: { creditBalance: { gt: 0 } },
      }),
      prisma.customer.findMany({
        where: {
          creditBalance: { gt: 0 },
          ...(query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { document: { contains: query } },
            ],
          } : {}),
        },
        select: {
          id: true,
          name: true,
          document: true,
          creditBalance: true,
          creditEntries: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
          },
        },
        orderBy: { creditBalance: 'desc' },
        take: 50,
      }),
    ]);

    const totalActive = await prisma.customer.aggregate({
      _sum: { creditBalance: true },
      where: { creditBalance: { gt: 0 } },
    });

    return successResponse({
      totalGranted: Number(totalGranted._sum.amount ?? 0),
      totalUsed: Number(totalUsed._sum.amount ?? 0),
      totalActive: Number(totalActive._sum.creditBalance ?? 0),
      clientsWithCredit,
      topClients: topClients.map((c) => ({
        id: c.id,
        name: c.name,
        document: c.document,
        creditBalance: Number(c.creditBalance),
        lastEntryDate: c.creditEntries[0]?.createdAt ?? null,
      })),
    });
  } catch (error) {
    console.error('GET /api/credits/summary error:', error);
    return errorResponse(error);
  }
}
