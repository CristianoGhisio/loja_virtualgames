import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';
import { withSecurity } from '@/lib/with-security';
import { successResponse } from '@/lib/api-response';

const getHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await checkAuth();
  if (!auth.authorized) {
    return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const osList = await prisma.serviceOrder.findMany({
    where: { customerId: id },
    orderBy: { createdAt: 'desc' },
  });
  return successResponse(osList);
};

export const GET = withSecurity(getHandler);
