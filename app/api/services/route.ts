import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();
    const onlyActive = searchParams.get('active') === 'true';

    const services = await prisma.service.findMany({
      where: {
        ...(onlyActive ? { active: true } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { internalCode: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: {
        name: 'asc'
      }
    });
    return successResponse(services);
  } catch (error) {
    console.error('API Error /services GET:', error);
    return errorResponse('Erro ao buscar serviços');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) return errorResponse('Não autorizado', 401);

    const json = await req.json();

    if (!json.name || json.priceBase === undefined || json.priceBase === null) {
      return errorResponse('Campos obrigatórios ausentes', 400);
    }

    let internalCode = typeof json.internalCode === 'string' ? json.internalCode.trim() : '';
    if (!internalCode) {
      const lastService = await prisma.service.findFirst({
        where: { internalCode: { startsWith: 'SRV-' } },
        orderBy: { internalCode: 'desc' },
        select: { internalCode: true },
      });
      const lastNumber = lastService?.internalCode ? parseInt(lastService.internalCode.replace('SRV-', ''), 10) : 0;
      const nextNumber = Number.isFinite(lastNumber) && lastNumber > 0 ? lastNumber + 1 : 1;
      internalCode = `SRV-${String(nextNumber).padStart(4, '0')}`;
    }

    const commissionType = json.commissionType === 'FIXED' ? 'FIXED' : 'PERCENT';
    const warrantyMonthsValue = Number(json.warrantyMonths);
    const warrantyMonths = Number.isFinite(warrantyMonthsValue)
      ? Math.max(0, Math.trunc(warrantyMonthsValue))
      : 0;

    const service = await prisma.service.create({
      data: {
        name: json.name,
        internalCode,
        descriptionShort: json.descriptionShort || null,
        priceBase: String(json.priceBase),
        priceType: json.priceType || 'FIXED',
        warrantyMonths,
        estimatedTimeMin: json.estimatedTimeMin ? parseInt(json.estimatedTimeMin) : null,
        commissionType,
        commissionValue: json.commissionValue ? String(json.commissionValue) : "0",
        
        active: json.active ?? true,
      },
    });

    return successResponse(service, 201);
  } catch (error: unknown) {
    console.error('API Error /services POST:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse('Código interno já cadastrado', 400);
    }
    return errorResponse('Erro ao criar serviço');
  }
}
