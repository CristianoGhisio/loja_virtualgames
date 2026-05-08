import { prisma } from '@/lib/prisma';
import { withSecurity } from '@/lib/with-security';
import { successResponse } from '@/lib/api-response';


export const dynamic = 'force-dynamic';

const getHandler = async () => {
  const usersCount = await prisma.user.count();
  return successResponse({ status: 'ok', database: 'connected', usersCount });
};

export const GET = withSecurity(getHandler);
