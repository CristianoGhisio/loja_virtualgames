import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth, hasApiPermission } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        creditBalance: true,
        creditEntries: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            amount: true,
            balanceBefore: true,
            balanceAfter: true,
            description: true,
            referenceId: true,
            referenceType: true,
            saleId: true,
            productId: true,
            expiresAt: true,
            createdAt: true,
            createdBy: true,
          },
        },
      },
    });

    if (!customer) {
      return errorResponse(new Error('Cliente não encontrado'), 404);
    }

    return successResponse({
      balance: Number(customer.creditBalance),
      entries: customer.creditEntries.map((entry) => ({
        ...entry,
        amount: Number(entry.amount),
        balanceBefore: Number(entry.balanceBefore),
        balanceAfter: Number(entry.balanceAfter),
      })),
    });
  } catch (error) {
    console.error(`GET /api/clients/${id}/credit error:`, error);
    return errorResponse(error);
  }
}
