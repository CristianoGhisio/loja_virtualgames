import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { SalesService } from '@/lib/services/sales';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;

    if (!user?.id) {
      throw new Error('Unauthorized');
    }

    const { id } = await context.params;
    const sale = await SalesService.completeSale(id, user.id);
    return successResponse(sale);
  } catch (error) {
    return errorResponse(error);
  }
}
