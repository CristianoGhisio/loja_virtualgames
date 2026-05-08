import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

const addMonthsKeepingDay = (baseDate: Date, monthsToAdd: number) => {
  const day = baseDate.getDate();
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const targetMonthIndex = month + monthsToAdd;
  const firstDayTarget = new Date(year, targetMonthIndex, 1);
  const lastDayTarget = new Date(firstDayTarget.getFullYear(), firstDayTarget.getMonth() + 1, 0).getDate();
  const targetDay = Math.min(day, lastDayTarget);

  return new Date(
    firstDayTarget.getFullYear(),
    firstDayTarget.getMonth(),
    targetDay,
    baseDate.getHours(),
    baseDate.getMinutes(),
    baseDate.getSeconds(),
    baseDate.getMilliseconds()
  );
};

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope');
    if (scope === 'commissions_pending') {
      const now = new Date();
      const competenceMonth = Number(searchParams.get('competenceMonth')) || now.getMonth() + 1;
      const competenceYear = Number(searchParams.get('competenceYear')) || now.getFullYear();
      const grouped = await prisma.serviceCommissionProvision.groupBy({
        by: ['technicianUserId'],
        where: {
          status: 'PROVISIONED',
          competenceMonth,
          competenceYear,
        },
        _sum: {
          commissionAmount: true,
        },
        _count: {
          technicianUserId: true,
        },
      });
      const technicians = await prisma.user.findMany({
        where: {
          id: { in: grouped.map((item) => item.technicianUserId) },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      const technicianById = new Map(technicians.map((item) => [item.id, item]));
      const data = grouped.map((item) => ({
        technicianUserId: item.technicianUserId,
        technicianName: technicianById.get(item.technicianUserId)?.name ?? technicianById.get(item.technicianUserId)?.email ?? 'Técnico',
        servicesCount: item._count.technicianUserId,
        totalCommission: Number(item._sum.commissionAmount ?? 0),
        competenceMonth,
        competenceYear,
      }));
      return successResponse(data);
    }

    const status = searchParams.get('status');
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');

    const where: Prisma.PayableWhereInput = {};

    if (status && status !== 'ALL') {
      where.status = status as 'PENDING' | 'PAID' | 'CANCELLED';
    }

    if (query) {
      where.OR = [
        { description: { contains: query, mode: 'insensitive' } },
        { supplier: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (category) {
      where.costCenter = { name: { contains: category, mode: 'insensitive' } };
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    } else if (from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    }

    const items = await prisma.payable.findMany({
      where,
      include: {
        supplier: true,
        costCenter: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const enriched = items.map((item) => ({
      ...item,
      category: item.costCenter?.name ?? '-',
      computedStatus:
        item.status === 'PAID'
          ? 'PAID'
          : new Date(item.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
            ? 'OVERDUE'
            : 'PENDING',
    }));

    return successResponse(enriched);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const action = body.action as string | undefined;

    if (action === 'pay') {
      const schema = z.object({
        action: z.literal('pay'),
        id: z.string(),
        paidAt: z.string().optional(),
      });
      const parsed = schema.parse(body);

      const payable = await prisma.payable.findUnique({ where: { id: parsed.id } });
      if (!payable) throw new Error('Conta a pagar não encontrada');
      if (payable.status === 'PAID') return successResponse({ success: true });

      await prisma.$transaction(async (tx) => {
        await tx.payable.update({
          where: { id: parsed.id },
          data: { status: 'PAID' },
        });

        await tx.cashMovement.create({
          data: {
            type: 'OUT',
            value: payable.value,
            description: `Pagamento: ${payable.description}`,
            payableId: payable.id,
            userId: user?.id,
            date: parsed.paidAt ? new Date(parsed.paidAt) : new Date(),
          },
        });
      });

      return successResponse({ success: true });
    }

    if (action === 'pay_commissions_batch') {
      const schema = z.object({
        action: z.literal('pay_commissions_batch'),
        competenceMonth: z.number().int().min(1).max(12),
        competenceYear: z.number().int().min(2020).max(2100),
        technicianIds: z.array(z.string()).optional(),
        paidAt: z.string().optional(),
      });
      const parsed = schema.parse(body);
      const paidAt = parsed.paidAt ? new Date(parsed.paidAt) : new Date();

      const provisions = await prisma.serviceCommissionProvision.findMany({
        where: {
          competenceMonth: parsed.competenceMonth,
          competenceYear: parsed.competenceYear,
          status: 'PROVISIONED',
          technicianUserId: parsed.technicianIds?.length
            ? { in: parsed.technicianIds }
            : undefined,
        },
      });

      if (provisions.length === 0) {
        return successResponse({
          success: true,
          paidCount: 0,
          totalPaid: 0,
        });
      }

      const amountByTechnician = new Map<string, number>();
      for (const provision of provisions) {
        amountByTechnician.set(
          provision.technicianUserId,
          (amountByTechnician.get(provision.technicianUserId) ?? 0) + Number(provision.commissionAmount)
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        let costCenter = await tx.costCenter.findFirst({
          where: {
            type: 'EXPENSE',
            name: { equals: 'Pagamento de Comissão Técnica', mode: 'insensitive' },
          },
        });
        if (!costCenter) {
          costCenter = await tx.costCenter.create({
            data: {
              name: 'Pagamento de Comissão Técnica',
              type: 'EXPENSE',
              active: true,
            },
          });
        }

        let totalPaid = 0;
        let paidCount = 0;
        for (const [technicianUserId, totalValue] of amountByTechnician.entries()) {
          const payable = await tx.payable.create({
            data: {
              description: `Comissão técnica ${String(parsed.competenceMonth).padStart(2, '0')}/${parsed.competenceYear}`,
              dueDate: paidAt,
              value: Number(totalValue.toFixed(2)),
              status: 'PAID',
              costCenterId: costCenter.id,
              payableType: 'TECHNICIAN_COMMISSION',
              technicianUserId,
              competenceMonth: parsed.competenceMonth,
              competenceYear: parsed.competenceYear,
            },
          });

          await tx.cashMovement.create({
            data: {
              type: 'OUT',
              value: Number(totalValue.toFixed(2)),
              description: `Pagamento comissão técnica ${String(parsed.competenceMonth).padStart(2, '0')}/${parsed.competenceYear}`,
              payableId: payable.id,
              userId: user?.id,
              date: paidAt,
            },
          });

          await tx.serviceCommissionProvision.updateMany({
            where: {
              technicianUserId,
              competenceMonth: parsed.competenceMonth,
              competenceYear: parsed.competenceYear,
              status: 'PROVISIONED',
            },
            data: {
              status: 'PAID',
              paidAt,
              payableId: payable.id,
            },
          });

          totalPaid += Number(totalValue.toFixed(2));
          paidCount += 1;
        }

        return { paidCount, totalPaid: Number(totalPaid.toFixed(2)) };
      });

      return successResponse({
        success: true,
        ...result,
      });
    }

    const schema = z.object({
      description: z.string().min(3),
      dueDate: z.string(),
      value: z.number().positive(),
      supplierId: z.string().optional(),
      costCenterId: z.string().optional(),
      attachmentUrl: z.string().optional(),
      category: z.string().optional(),
      recurring: z.boolean().optional(),
      recurringInstallments: z.number().int().min(1).max(120).optional(),
    });
    const parsed = schema.parse(body);

    let resolvedCostCenterId = parsed.costCenterId;
    if (!resolvedCostCenterId && parsed.category?.trim()) {
      const categoryName = parsed.category.trim();
      const existing = await prisma.costCenter.findFirst({
        where: {
          type: 'EXPENSE',
          name: { equals: categoryName, mode: 'insensitive' },
        },
      });
      if (existing) {
        resolvedCostCenterId = existing.id;
      } else {
        const created = await prisma.costCenter.create({
          data: { name: categoryName, type: 'EXPENSE', active: true },
        });
        resolvedCostCenterId = created.id;
      }
    }

    const baseDueDate = new Date(parsed.dueDate);
    const installments = parsed.recurring ? parsed.recurringInstallments ?? 1 : 1;

    await prisma.$transaction(async (tx) => {
      for (let installment = 0; installment < installments; installment += 1) {
        const dueDate = installment === 0 ? baseDueDate : addMonthsKeepingDay(baseDueDate, installment);
        await tx.payable.create({
          data: {
            description: parsed.description,
            dueDate,
            value: parsed.value,
            supplierId: parsed.supplierId || undefined,
            costCenterId: resolvedCostCenterId || undefined,
            attachmentUrl: parsed.attachmentUrl || null,
            status: 'PENDING',
            payableType: 'DEFAULT',
          },
        });
      }
    });

    return successResponse({ success: true, created: installments }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const schema = z.object({
      id: z.string(),
      description: z.string().min(3),
      dueDate: z.string(),
      value: z.number().positive(),
      costCenterId: z.string().optional(),
      category: z.string().optional(),
      attachmentUrl: z.string().optional(),
    });
    const parsed = schema.parse(body);

    const payable = await prisma.payable.findUnique({
      where: { id: parsed.id },
      include: { costCenter: true },
    });
    if (!payable) {
      return errorResponse(new Error('Conta a pagar não encontrada'), 404);
    }
    if (payable.status === 'PAID') {
      return errorResponse(new Error('Despesa paga não pode ser editada'), 400);
    }

    let resolvedCostCenterId = parsed.costCenterId;
    if (!resolvedCostCenterId && parsed.category?.trim()) {
      const categoryName = parsed.category.trim();
      const existing = await prisma.costCenter.findFirst({
        where: {
          type: 'EXPENSE',
          name: { equals: categoryName, mode: 'insensitive' },
        },
      });
      if (existing) {
        resolvedCostCenterId = existing.id;
      } else {
        const created = await prisma.costCenter.create({
          data: { name: categoryName, type: 'EXPENSE', active: true },
        });
        resolvedCostCenterId = created.id;
      }
    }

    await prisma.payable.update({
      where: { id: parsed.id },
      data: {
        description: parsed.description,
        dueDate: new Date(parsed.dueDate),
        value: parsed.value,
        costCenterId: resolvedCostCenterId || null,
        attachmentUrl: parsed.attachmentUrl || null,
      },
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return errorResponse(new Error('ID da despesa é obrigatório'), 400);
    }

    const payable = await prisma.payable.findUnique({ where: { id } });
    if (!payable) {
      return errorResponse(new Error('Conta a pagar não encontrada'), 404);
    }
    if (payable.status === 'PAID') {
      return errorResponse(new Error('Despesa paga não pode ser excluída'), 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.cashMovement.deleteMany({
        where: { payableId: id },
      });
      await tx.payable.delete({
        where: { id },
      });
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
