import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateNetForPayment } from '@/lib/services/payment-fees';
import { ensureDailyCashOpen } from '@/lib/services/daily-cash';

interface RegisterPaymentInput {
  receivableId: string;
  paymentMethod: string;
  userId?: string;
  cardFeePercent?: number;
  paidValue?: number;
  paidAt?: Date;
}

export class FinancialService {
  private static toFixed2(value: number) {
    return Number(value.toFixed(2));
  }

  private static async provisionServiceCommissions(
    tx: Prisma.TransactionClient,
    serviceOrderId: string,
    paidAt: Date
  ) {
    const serviceOrder = await tx.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: {
        items: {
          where: {
            type: 'SERVICE',
            serviceId: { not: null },
          },
          include: {
            service: {
              select: {
                id: true,
                commissionType: true,
                commissionValue: true,
              },
            },
          },
        },
      },
    });

    if (!serviceOrder?.technicianId) return;

    const competenceMonth = paidAt.getMonth() + 1;
    const competenceYear = paidAt.getFullYear();

    for (const item of serviceOrder.items) {
      if (!item.service || !item.serviceId) continue;

      const baseAmount = Number(item.total);
      const commissionPercent =
        item.service.commissionType === 'PERCENT'
          ? Number(item.service.commissionValue)
          : 0;
      const commissionAmount =
        item.service.commissionType === 'PERCENT'
          ? (baseAmount * commissionPercent) / 100
          : Number(item.service.commissionValue) * item.quantity;

      await tx.serviceCommissionProvision.upsert({
        where: {
          serviceOrderItemId_technicianUserId: {
            serviceOrderItemId: item.id,
            technicianUserId: serviceOrder.technicianId,
          },
        },
        update: {
          competenceMonth,
          competenceYear,
          baseAmount: FinancialService.toFixed2(baseAmount),
          commissionPercent: FinancialService.toFixed2(commissionPercent),
          commissionAmount: FinancialService.toFixed2(commissionAmount),
          status: 'PROVISIONED',
          paidAt: null,
          payableId: null,
        },
        create: {
          serviceOrderId: serviceOrder.id,
          serviceOrderItemId: item.id,
          serviceId: item.serviceId,
          technicianUserId: serviceOrder.technicianId,
          competenceMonth,
          competenceYear,
          baseAmount: FinancialService.toFixed2(baseAmount),
          commissionPercent: FinancialService.toFixed2(commissionPercent),
          commissionAmount: FinancialService.toFixed2(commissionAmount),
          status: 'PROVISIONED',
        },
      });
    }
  }

  static async registerPayment(data: RegisterPaymentInput, transaction?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      await ensureDailyCashOpen(tx);
      const receivable = await tx.receivable.findUnique({ where: { id: data.receivableId } });
      if (!receivable) throw new Error("Receivable not found");

      if (receivable.status === 'PAID') throw new Error("Already paid");

      const grossValue = data.paidValue ?? Number(receivable.value);
      const paymentData = await calculateNetForPayment(tx, grossValue, data.paymentMethod, data.cardFeePercent);
      const paymentDate = data.paidAt ?? new Date();

      await tx.cashMovement.create({
        data: {
          type: 'IN',
          value: paymentData.netValue,
          description: `Payment for ${receivable.description}`,
          receivableId: data.receivableId,
          userId: data.userId,
          date: paymentDate,
        },
      });

      await tx.receivable.update({
        where: { id: data.receivableId },
        data: {
          status: 'PAID',
          paymentMethod: paymentData.paymentMethod,
          cardFeePercent: paymentData.cardFeePercent > 0 ? paymentData.cardFeePercent : null,
          cardFeeValue: paymentData.cardFeeValue > 0 ? paymentData.cardFeeValue : null,
          netValue: paymentData.netValue,
          paidAt: paymentDate,
        },
      });

      if (receivable.serviceOrderId) {
        await FinancialService.provisionServiceCommissions(tx, receivable.serviceOrderId, paymentDate);
      }
    };

    if (transaction) {
      return execute(transaction);
    }

    return prisma.$transaction(execute);
  }

  static async registerExpense(description: string, value: number, categoryId: string, userId: string) {
      return await prisma.$transaction(async (tx) => {
          await tx.payable.create({
              data: {
                  description,
                  value,
                  dueDate: new Date(),
                  status: 'PAID',
                  costCenterId: categoryId,
                  movements: {
                      create: {
                          type: 'OUT',
                          value,
                          description,
                          userId
                      }
                  }
              }
          });
      });
  }
}
