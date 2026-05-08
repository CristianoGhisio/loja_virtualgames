
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const counts = await prisma.serviceOrder.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Convert array to object for easier lookup
    // { ENTRADA: 5, DIAGNOSTICO: 2, ... }
    const stats = counts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return successResponse(stats);
  } catch (error) {
    return errorResponse(error);
  }
}
