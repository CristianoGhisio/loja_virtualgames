import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { OSService } from '@/lib/services/os';
import { OSStatus, OSPriority } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { FinancialService } from '@/lib/services/financial';
import { ensureDailyCashOpen } from '@/lib/services/daily-cash';


export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const statusValue = status && Object.values(OSStatus).includes(status as OSStatus)
      ? (status as OSStatus)
      : undefined;
    const where = statusValue ? { status: statusValue } : {};

    const [total, osList] = await Promise.all([
      prisma.serviceOrder.count({ where }),
      prisma.serviceOrder.findMany({
        where,
        skip,
        take: limit,
        include: { 
          customer: true, 
          items: true,
          receivable: true,
          technician: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse({
      data: osList,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// Update Status Endpoint
export async function PUT(req: NextRequest) {
  try {
    const { authorized, session, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const schema = z.object({
      id: z.string(),
      status: z.enum(['ENTRADA', 'DIAGNOSTICO', 'ORCAMENTO', 'AGUARDANDO_APROVACAO', 'APROVADO', 'EM_REPARO', 'AGUARDANDO_PECA', 'FINALIZADO', 'ENTREGUE', 'CANCELADO']),
      notes: z.string().optional(),
    });

    const parsed = schema.parse(body);

    const userId = session?.user?.id;
    if (!userId) {
      return errorResponse(new Error('Unauthorized'), 401);
    }

    const result = await OSService.updateStatus(parsed.id, parsed.status, userId, parsed.notes);

    return successResponse(result);
  } catch (error) {
    console.error('PUT /api/os Error:', error);
    if (error instanceof Error && (
        error.message.includes('Insufficient stock') || 
        error.message.includes('Invalid status') ||
        error.message.includes('OS not found')
    )) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
        );
    }
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response, session } = await checkAuth();
    if (!authorized) return response;
    const userId = session?.user?.id;

    try {
      await ensureDailyCashOpen();
    } catch (error) {
      return errorResponse(error, 409);
    }

    const body = await req.json();
    const schema = z.object({
      customerId: z.string(),
      device: z.string(),
      serial: z.string().optional(),
      defect: z.string().optional(),
      notes: z.string().optional(),
      photos: z.array(z.string()).max(3).optional(),
      services: z.array(
        z.object({
          serviceId: z.string(),
          quantity: z.number().int().min(1),
          unitPrice: z.number().min(0).optional(),
        })
      ).optional(),
      prepaid: z.boolean().optional(),
      paymentMethod: z.enum(['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO', 'CARTAO', 'CREDITO_LOJA', 'pix', 'dinheiro', 'credito', 'debito']).optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
      accessories: z.string().optional(), // Mapping to notes or description if needed, or append to device
      condition: z.string().optional(), // Mapping to notes
      sourceCardId: z.string().optional(),
      sourceFlowKind: z.enum(['SERVICE']).optional(),
    });

    const parsed = schema.parse(body);

    // Append extra info to notes/description if not present in schema
    let finalNotes = parsed.notes || '';
    if (parsed.condition) finalNotes += `\nEstado: ${parsed.condition}`;
    if (parsed.accessories) finalNotes += `\nAcessórios: ${parsed.accessories}`;
    const photoReport = parsed.photos && parsed.photos.length > 0
      ? JSON.stringify({ photos: parsed.photos })
      : undefined;

    const requestedServices = parsed.services || [];
    const requestedServiceIds = requestedServices.map((item) => item.serviceId);
    const servicesFromDb = requestedServiceIds.length > 0
      ? await prisma.service.findMany({
          where: {
            id: { in: requestedServiceIds },
            active: true,
          },
        })
      : [];
    const serviceById = new Map(servicesFromDb.map((service) => [service.id, service]));

    if (requestedServices.length > 0 && servicesFromDb.length !== requestedServices.length) {
      return errorResponse('Serviço inválido na seleção', 400);
    }

    const serviceItemsData = requestedServices.map((item) => {
      const service = serviceById.get(item.serviceId);
      if (!service) {
        throw new Error('Serviço inválido na seleção');
      }
      const unitPrice = item.unitPrice !== undefined ? item.unitPrice : Number(service.priceBase);
      const total = unitPrice * item.quantity;
      return {
        type: 'SERVICE' as const,
        serviceId: service.id,
        name: service.name,
        quantity: item.quantity,
        unitPrice,
        costPrice: 0,
        warrantyMonths: Math.max(0, Number(service.warrantyMonths ?? 0)),
        total,
      };
    });

    const totalServices = serviceItemsData.reduce((acc, item) => acc + item.total, 0);
    const prepaid = parsed.prepaid ?? false;

    const os = await prisma.$transaction(async (tx) => {
      const createdOs = await tx.serviceOrder.create({
        data: {
          customerId: parsed.customerId,
          device: parsed.device,
          serial: parsed.serial,
          defect: parsed.defect?.trim() || 'Sem defeito informado',
          notes: finalNotes,
          report: photoReport,
          priority: parsed.priority as OSPriority,
          status: 'ENTRADA',
          entryDate: new Date(),
          totalServices,
          total: totalServices,
        },
      });

      if (serviceItemsData.length > 0) {
        await tx.serviceOrderItem.createMany({
          data: serviceItemsData.map((item) => ({
            serviceOrderId: createdOs.id,
            type: item.type,
            serviceId: item.serviceId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice,
            warrantyMonths: item.warrantyMonths,
            total: item.total,
          })),
        });
      }

      if (parsed.sourceCardId && parsed.sourceFlowKind === 'SERVICE') {
        await tx.$executeRaw`
          INSERT INTO "CustomerInterestFlow"
            ("id", "funnelCardId", "kind", "status", "serviceOrderId", "createdAt", "updatedAt")
          VALUES
            (${crypto.randomUUID()}, ${parsed.sourceCardId}, 'SERVICE', 'IN_PROGRESS', ${createdOs.id}, NOW(), NOW())
          ON CONFLICT ("funnelCardId", "kind")
          DO UPDATE SET
            "status" = 'IN_PROGRESS',
            "serviceOrderId" = ${createdOs.id},
            "updatedAt" = NOW()
        `;
      }

      if (prepaid && totalServices > 0) {
        const revenueCostCenter = await tx.costCenter.findFirst({
          where: { type: 'REVENUE' },
        });

        const receivable = await tx.receivable.create({
          data: {
            description: `OS #${createdOs.id.slice(-6).toUpperCase()} - Pagamento antecipado`,
            origin: 'SERVICE',
            value: totalServices,
            dueDate: new Date(),
            status: 'PENDING',
            serviceOrderId: createdOs.id,
            customerId: createdOs.customerId,
            costCenterId: revenueCostCenter?.id,
          },
        });

        await FinancialService.registerPayment({
          receivableId: receivable.id,
          paymentMethod: parsed.paymentMethod || 'DINHEIRO',
          paidValue: totalServices,
          userId,
        }, tx);
      }

      return createdOs;
    });

    return successResponse(os, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
