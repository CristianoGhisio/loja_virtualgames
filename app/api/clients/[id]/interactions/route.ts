import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const interactions = await prisma.customerInteraction.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    console.error('GET /api/clients/[id]/interactions error:', error);
    return NextResponse.json(
      { message: 'Erro ao listar interações' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await request.json().catch(() => ({}));
  await context.params;
  return NextResponse.json(
    { message: 'Inserção direta desabilitada. Use o módulo Atendimento para registrar interações.' },
    { status: 403 }
  );
}
