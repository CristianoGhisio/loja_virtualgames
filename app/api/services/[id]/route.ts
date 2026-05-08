import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;
    const json = await request.json();
    const internalCode = typeof json.internalCode === 'string' && json.internalCode.trim() ? json.internalCode.trim() : undefined;
    const commissionType = json.commissionType === 'FIXED' ? 'FIXED' : 'PERCENT';
    const warrantyMonthsValue = Number(json.warrantyMonths);
    const warrantyMonths = Number.isFinite(warrantyMonthsValue)
      ? Math.max(0, Math.trunc(warrantyMonthsValue))
      : undefined;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: json.name,
        internalCode,
        descriptionShort: json.descriptionShort || null,
        priceBase: json.priceBase !== undefined ? String(json.priceBase) : undefined,
        priceType: json.priceType,
        warrantyMonths,
        estimatedTimeMin: json.estimatedTimeMin !== undefined ? (json.estimatedTimeMin ? parseInt(json.estimatedTimeMin) : null) : undefined,
        commissionType,
        commissionValue: json.commissionValue !== undefined ? String(json.commissionValue) : undefined,
        
        active: json.active,
      },
    });
    return NextResponse.json(service);
  } catch (error: unknown) {
    console.error('API Error /services/[id] PUT:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Código interno já cadastrado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro ao atualizar serviço' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;
    // Soft delete: just deactivate
    await prisma.service.update({
      where: { id },
      data: { active: false }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error /services/[id] DELETE:', error);
    return NextResponse.json({ error: 'Erro ao excluir serviço' }, { status: 500 });
  }
}
