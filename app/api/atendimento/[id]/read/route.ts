import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';


export const dynamic = 'force-dynamic';

export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await context.params;

    const card = await prisma.customerFunnelCard.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!card) {
      return errorResponse(new Error('Card não encontrado'), 404);
    }

    await prisma.customerFunnelCard.update({
      where: { id },
      data: { hasNewMessage: false },
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
