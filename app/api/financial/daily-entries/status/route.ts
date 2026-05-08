import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getDailyCashStatus } from '@/lib/services/daily-cash';

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const cashStatus = await getDailyCashStatus();
    return successResponse(cashStatus);
  } catch (error) {
    return errorResponse(error);
  }
}
