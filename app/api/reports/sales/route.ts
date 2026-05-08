import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { PrismaClient } from '@prisma/client';


export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = end ? new Date(end) : new Date();

    // Group by day
    const salesByDay = await prisma.sale.groupBy({
      by: ['date'],
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Format for chart
    // Note: groupBy returns Date objects, we might need to format them to strings YYYY-MM-DD
    const formatted = salesByDay.map(item => ({
      date: item.date.toISOString().split('T')[0],
      total: Number(item._sum.total),
      count: item._count.id,
    }));

    // Calculate total stats
    const totalRevenue = formatted.reduce((acc, curr) => acc + curr.total, 0);
    const totalCount = formatted.reduce((acc, curr) => acc + curr.count, 0);

    return successResponse({
      chartData: formatted,
      summary: {
        totalRevenue,
        totalCount,
        period: { start: startDate, end: endDate }
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}
