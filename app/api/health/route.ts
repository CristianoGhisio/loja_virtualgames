import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  const dbDown = checks.database === 'error';

  return NextResponse.json(
    {
      status: dbDown ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      checks,
    },
    { status: dbDown ? 503 : 200 }
  );
}
