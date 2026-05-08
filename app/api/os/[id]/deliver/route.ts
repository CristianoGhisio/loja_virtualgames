
import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { StockService } from '@/lib/services/stock';
import { FinancialService } from '@/lib/services/financial';
import { ensureDailyCashOpen } from '@/lib/services/daily-cash';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized || !user) {
        return response || errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const payload = await req.json().catch(() => ({}));
    const parsedBody = z.object({
      paymentMethod: z.enum(['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO', 'CARTAO', 'CREDITO_LOJA', 'pix', 'dinheiro', 'credito', 'debito']).optional(),
    }).parse(payload);

    // 1. Fetch OS with Financials and Items
    const os = await prisma.serviceOrder.findUnique({
      where: { id },
      include: { 
        receivable: true,
        items: true // Need items for stock deduction
      }
    });

    if (!os) return errorResponse('OS not found', 404);
    if (os.status === 'ENTREGUE') {
      return successResponse({ success: true, alreadyDelivered: true });
    }
    const isCancelledDelivery = os.status === 'CANCELADO';
    if (os.status !== 'FINALIZADO' && !isCancelledDelivery) {
      return errorResponse('A OS precisa estar finalizada ou cancelada para ser entregue', 400);
    }

    if (!isCancelledDelivery) {
      try {
        await ensureDailyCashOpen();
      } catch (error) {
        return errorResponse(error, 409);
      }
    }

    // 2. Calculate Financials
    let paid = 0;
    let remaining = 0;
    
    if (!isCancelledDelivery) {
      const total = Number(os.total);

      if (os.receivable && os.receivable.status === 'PAID') {
        paid = Number(os.receivable.value);
      }

      const otherReceivablesWhere: Prisma.ReceivableWhereInput = {
        description: { contains: `OS #${os.id.slice(-6).toUpperCase()}` },
        status: 'PAID',
      };
      if (os.receivable?.id) {
        otherReceivablesWhere.id = { not: os.receivable.id };
      }
      const otherReceivables = await prisma.receivable.findMany({
        where: otherReceivablesWhere,
      });

      const otherPaid = otherReceivables.reduce((acc, curr) => acc + Number(curr.value), 0);
      paid += otherPaid;
      remaining = Math.max(0, total - paid);
    }

    // 3. Execute Atomic Transaction
    await prisma.$transaction(async (tx) => {
        // A. Register Receivable (if needed)
        if (!isCancelledDelivery && remaining > 0) {
            if (!parsedBody.paymentMethod) {
                throw new Error('Forma de pagamento é obrigatória para concluir a entrega com saldo pendente');
            }
            const costCenter = await tx.costCenter.findFirst({ where: { type: 'REVENUE' } });
            const canLink = !os.receivable;
            
            const receivable = await tx.receivable.create({
                data: {
                    description: `OS #${os.id.slice(-6).toUpperCase()} - Entrega`,
                    origin: 'SERVICE',
                    value: remaining,
                    dueDate: new Date(),
                    status: 'PENDING',
                    serviceOrderId: canLink ? os.id : undefined,
                    customerId: os.customerId,
                    costCenterId: costCenter?.id
                }
            });

            await FinancialService.registerPayment({
                receivableId: receivable.id,
                paymentMethod: parsedBody.paymentMethod,
                paidValue: remaining,
                userId: user.id,
            }, tx);
        }

        // B. Deduct Stock (idempotente por produto/OS)
        if (!isCancelledDelivery) {
          const requiredByProduct = new Map<string, number>();
          for (const item of os.items) {
            if (!item.productId) continue;
            const qty = Math.abs(Number(item.quantity || 0));
            if (qty <= 0) continue;
            requiredByProduct.set(item.productId, (requiredByProduct.get(item.productId) || 0) + qty);
          }

          if (requiredByProduct.size > 0) {
            const movedByProduct = await tx.stockMovement.groupBy({
              by: ['productId'],
              where: {
                referenceId: os.id,
                type: 'OUT_SERVICE_PART',
                productId: { in: Array.from(requiredByProduct.keys()) },
              },
              _sum: { quantity: true },
            });

            const alreadyMovedMap = new Map<string, number>(
              movedByProduct.map((row) => [row.productId, Math.abs(Number(row._sum.quantity || 0))])
            );

            for (const [productId, requiredQty] of requiredByProduct.entries()) {
              const alreadyMoved = alreadyMovedMap.get(productId) || 0;
              const pendingQty = Math.max(requiredQty - alreadyMoved, 0);
              if (pendingQty <= 0) continue;

              await StockService.moveStock(
                productId,
                pendingQty,
                'OUT_SERVICE_PART',
                `OS #${os.id} Entregue`,
                os.id,
                user.id,
                tx
              );
            }
          }
        }

        // C. Update OS Status
        await tx.serviceOrder.update({
            where: { id: os.id },
            data: {
                status: 'ENTREGUE',
                endDate: new Date(),
            },
        });

        // D. Log History
        await tx.serviceOrderHistory.create({
            data: {
                serviceOrderId: os.id,
                status: 'ENTREGUE',
                notes: isCancelledDelivery
                  ? 'Devolução realizada com verificação presencial (OS cancelada, sem cobrança).'
                  : 'Entrega realizada com verificação e pagamento confirmado (Via Sistema).',
                userId: user.id,
            },
        });

    });

    return successResponse({ success: true });

  } catch (error: unknown) {
    console.error('Error delivering OS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    if (
      errorMessage.includes('Forma de pagamento é obrigatória') ||
      errorMessage.includes('Insufficient stock') ||
      errorMessage.includes('Already paid') ||
      errorMessage.includes('A OS precisa estar finalizada ou cancelada')
    ) {
      return errorResponse(errorMessage, 400);
    }
    return errorResponse(`Erro ao processar entrega: ${errorMessage}`, 500);
  }
}
