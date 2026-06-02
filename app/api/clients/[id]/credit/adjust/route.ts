import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkAuth, hasApiPermission } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const adjustSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  type: z.enum(['CREDIT', 'DEBIT']),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const { authorized, session, response, user } = await checkAuth();
    if (!authorized) return response;

    // Permissão será refinada na Fase 5; por enquanto, apenas autenticado
    if (!hasApiPermission(user, 'credits', 'adjust')) {
      // Fallback: permitir admin temporariamente
      const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'Admin';
      if (!isAdmin) {
        return errorResponse(new Error('Permissão negada'), 403);
      }
    }

    const body = await request.json();
    const parsed = adjustSchema.parse(body);

    const userId = session?.user?.id;

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id },
        select: { creditBalance: true, name: true },
      });

      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      const balanceBefore = Number(customer.creditBalance);

      let balanceAfter: number;
      if (parsed.type === 'CREDIT') {
        balanceAfter = balanceBefore + parsed.amount;
      } else {
        balanceAfter = balanceBefore - parsed.amount;
        if (balanceAfter < 0) {
          throw new Error('Saldo de crédito insuficiente para este débito');
        }
      }

      const entry = await tx.customerCredit.create({
        data: {
          customerId: id,
          type: parsed.type,
          amount: parsed.amount,
          balanceBefore,
          balanceAfter,
          description: parsed.description,
          referenceType: 'MANUAL',
          createdBy: userId,
        },
      });

      await tx.customer.update({
        where: { id },
        data: { creditBalance: balanceAfter },
      });

      // Registrar auditoria
      await tx.auditLog.create({
        data: {
          action: 'CREDIT_ADJUST',
          module: 'credits',
          entity: 'CustomerCredit',
          entityId: entry.id,
          userId,
          oldValue: String(balanceBefore),
          newValue: String(balanceAfter),
        },
      });

      return { entry, balanceBefore, balanceAfter };
    });

    return successResponse({
      id: result.entry.id,
      type: result.entry.type,
      amount: Number(result.entry.amount),
      balanceBefore: result.balanceBefore,
      balanceAfter: result.balanceAfter,
      description: result.entry.description,
      createdAt: result.entry.createdAt,
    }, 201);
  } catch (error) {
    console.error(`POST /api/clients/${id}/credit/adjust error:`, error);
    return errorResponse(error);
  }
}
