import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { executeWhatsappAction, getWhatsappStatus } from '@/lib/services/whatsapp-bot-control';


export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  action: z.enum(['connect', 'reconnect', 'disconnect']),
});

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const status = await getWhatsappStatus();
    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await request.json();
    const parsed = bodySchema.parse(body);

    const status = await executeWhatsappAction(parsed.action);
    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
