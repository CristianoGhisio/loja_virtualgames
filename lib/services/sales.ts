import { SaleStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { StockService } from './stock';
import { prisma } from '@/lib/prisma';
import { FinancialService } from '@/lib/services/financial';

interface CreateSaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateSaleDTO {
  customerId?: string;
  items: CreateSaleItem[];
  paymentMethod: string;
  discount?: number;
  status?: SaleStatus;
  sourceCardId?: string;
  sourceFlowKind?: 'PRODUCT';
  creditUsed?: number;
  userId: string;
}

type InterestItem = {
  id: string;
  type: 'PRODUCT' | 'SERVICE';
  name: string;
};

function parseInterestPayload(raw: string | null): InterestItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as InterestItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.id && (item.type === 'PRODUCT' || item.type === 'SERVICE'));
  } catch {
    return [];
  }
}

export class SalesService {
  static async hasCustomerInterestFlowTable() {
    const result = await prisma.$queryRaw<Array<{ regclass: string | null }>>(Prisma.sql`
      SELECT to_regclass('public."CustomerInterestFlow"')::text AS regclass
    `);
    return Boolean(result[0]?.regclass);
  }

  static async createSale(data: CreateSaleDTO) {
    const flowTableAvailable = await SalesService.hasCustomerInterestFlowTable();
    return await prisma.$transaction(async (tx) => {
      let total = 0;
      const itemsData: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        costPrice: number;
        warrantyMonths: number;
        total: number;
      }> = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { stock: true }
        });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const itemTotal = item.quantity * item.unitPrice;
        total += itemTotal;

        itemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: Number(product.stock?.averageCost || 0), // Snapshot cost
          warrantyMonths: Math.max(0, Number(product.warrantyMonths ?? 0)),
          total: itemTotal,
        });
      }

      const finalTotal = total - (data.discount || 0);
      const saleStatus = data.status ?? SaleStatus.COMPLETED;

      const sale = await tx.sale.create({
        data: {
          customerId: data.customerId,
          date: new Date(),
          total: finalTotal,
          discount: data.discount || 0,
          status: saleStatus,
          paymentMethod: data.paymentMethod,
          createdBy: data.userId,
        },
      });

      for (const item of itemsData) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            ...item,
          },
        });
      }

      if (saleStatus === SaleStatus.COMPLETED) {
        for (const item of itemsData) {
          await StockService.moveStock(
            item.productId,
            item.quantity,
            'OUT_SALE',
            `Sale #${sale.id}`,
            sale.id,
            data.userId,
            tx
          );
        }

        const revenueCostCenter = await tx.costCenter.findFirst({
          where: { type: 'REVENUE' },
        });

        // Debit customer credit if used
        if (data.creditUsed && data.creditUsed > 0 && data.customerId) {
          const customer = await tx.customer.findUnique({
            where: { id: data.customerId },
            select: { creditBalance: true },
          });

          const balanceBefore = Number(customer?.creditBalance ?? 0);

          if (balanceBefore < data.creditUsed) {
            throw new Error('Saldo de crédito insuficiente');
          }

          const balanceAfter = balanceBefore - data.creditUsed;

          await tx.customerCredit.create({
            data: {
              customerId: data.customerId,
              type: 'DEBIT',
              amount: data.creditUsed,
              balanceBefore,
              balanceAfter,
              description: `Crédito utilizado na venda #${sale.id}`,
              referenceId: sale.id,
              referenceType: 'SALE',
              saleId: sale.id,
              createdBy: data.userId,
            },
          });

          await tx.customer.update({
            where: { id: data.customerId },
            data: { creditBalance: balanceAfter },
          });
        }

        const creditUsed = data.creditUsed && data.creditUsed > 0 ? data.creditUsed : 0;
        const remainingTotal = finalTotal - creditUsed;

        const receivable = await tx.receivable.create({
          data: {
            description: `Venda #${sale.id}`,
            origin: 'SALE',
            value: remainingTotal > 0 ? remainingTotal : finalTotal,
            dueDate: new Date(),
            status: remainingTotal > 0 ? 'PENDING' : 'PAID',
            saleId: sale.id,
            customerId: data.customerId,
            costCenterId: revenueCostCenter?.id,
            paymentMethod: remainingTotal > 0 ? data.paymentMethod : 'CREDITO_LOJA',
            paidAt: remainingTotal > 0 ? undefined : sale.date,
          },
        });

        if (remainingTotal > 0) {
          await FinancialService.registerPayment({
            receivableId: receivable.id,
            paymentMethod: data.paymentMethod,
            paidValue: remainingTotal,
            userId: data.userId,
            paidAt: sale.date,
          }, tx);
        }

        if (data.customerId) {
          if (data.sourceCardId && data.sourceFlowKind === 'PRODUCT') {
            if (flowTableAvailable) {
              await tx.$executeRaw(Prisma.sql`
                INSERT INTO "CustomerInterestFlow"
                  ("id", "funnelCardId", "kind", "status", "saleId", "createdAt", "updatedAt")
                VALUES
                  (${crypto.randomUUID()}, ${data.sourceCardId}, 'PRODUCT', 'COMPLETED', ${sale.id}, NOW(), NOW())
                ON CONFLICT ("funnelCardId", "kind")
                DO UPDATE SET
                  "status" = 'COMPLETED',
                  "saleId" = ${sale.id},
                  "updatedAt" = NOW()
              `);
            }

            const sourceCard = await tx.customerFunnelCard.findUnique({
              where: { id: data.sourceCardId },
              select: {
                id: true,
                customerId: true,
                itemInterest: true,
              },
            });

            if (sourceCard) {
              await tx.customerFunnelCard.create({
                data: {
                  customerId: sourceCard.customerId,
                  stage: 'VENDA_CONCLUIDA',
                  sellerNote: `Venda ${sale.id} finalizada`,
                  active: true,
                },
              });

              if (flowTableAvailable) {
                const interests = parseInterestPayload(sourceCard.itemInterest);
                const hasProduct = interests.some((item) => item.type === 'PRODUCT');
                const hasService = interests.some((item) => item.type === 'SERVICE');

                const flows = await tx.$queryRaw<Array<{ kind: string; status: string }>>(Prisma.sql`
                  SELECT "kind", "status"
                  FROM "CustomerInterestFlow"
                  WHERE "funnelCardId" = ${sourceCard.id}
                `);

                const productDone = !hasProduct || flows.some((flow) => flow.kind === 'PRODUCT' && flow.status === 'COMPLETED');
                const serviceDone = !hasService || flows.some((flow) => flow.kind === 'SERVICE' && flow.status === 'COMPLETED');

                if (productDone && serviceDone) {
                  await tx.customerFunnelCard.update({
                    where: { id: sourceCard.id },
                    data: {
                      active: false,
                      archivedAt: new Date(),
                    },
                  });
                }
              } else {
                await tx.customerFunnelCard.update({
                  where: { id: sourceCard.id },
                  data: {
                    active: false,
                    archivedAt: new Date(),
                  },
                });
              }
            }
          } else {
          const currentCard = await tx.customerFunnelCard.findFirst({
            where: {
              customerId: data.customerId,
              active: true,
              stage: {
                in: ['CONTATO_QUENTE', 'EM_ANDAMENTO', 'NOVO_CONTATO', 'VENDA_CONCLUIDA'],
              },
            },
            orderBy: { updatedAt: 'desc' },
            select: { id: true },
          });

          if (currentCard) {
            await tx.customerFunnelCard.update({
              where: { id: currentCard.id },
              data: {
                stage: 'VENDA_CONCLUIDA',
                sellerNote: `Venda ${sale.id} finalizada`,
                active: true,
                archivedAt: null,
              },
            });
          } else {
            await tx.customerFunnelCard.create({
              data: {
                customerId: data.customerId,
                stage: 'VENDA_CONCLUIDA',
                sellerNote: `Venda ${sale.id} finalizada`,
                active: true,
              },
            });
          }

          await tx.customerInteraction.create({
            data: {
              customerId: data.customerId,
              type: 'CRM',
              content: `Card criado automaticamente em "Venda ou serviço Realizado" após venda ${sale.id}`,
            },
          });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          action: 'CREATE_SALE',
          module: 'SALES',
          entity: 'Sale',
          entityId: sale.id,
          userId: data.userId,
          newValue: JSON.stringify(data),
        },
      });

      return sale;
    });
  }

  static async completeSale(saleId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: true },
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      if (sale.status !== SaleStatus.PENDING) {
        throw new Error('Only pending sales can be completed');
      }

      for (const item of sale.items) {
        await StockService.moveStock(
          item.productId,
          item.quantity,
          'OUT_SALE',
          `Sale #${sale.id}`,
          sale.id,
          userId,
          tx
        );
      }

      const revenueCostCenter = await tx.costCenter.findFirst({
        where: { type: 'REVENUE' },
      });

      const receivable = await tx.receivable.upsert({
        where: { saleId: sale.id },
        update: {
          value: sale.total,
          dueDate: new Date(),
          origin: 'SALE',
          status: 'PENDING',
          customerId: sale.customerId,
          costCenterId: revenueCostCenter?.id,
          description: `Venda #${sale.id}`,
        },
        create: {
          description: `Venda #${sale.id}`,
          origin: 'SALE',
          value: sale.total,
          dueDate: new Date(),
          status: 'PENDING',
          saleId: sale.id,
          customerId: sale.customerId,
          costCenterId: revenueCostCenter?.id,
        },
      });

      await FinancialService.registerPayment({
        receivableId: receivable.id,
        paymentMethod: sale.paymentMethod,
        paidValue: Number(sale.total),
        userId,
        paidAt: new Date(),
      }, tx);

      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: { status: SaleStatus.COMPLETED },
      });

      if (sale.customerId) {
        const currentCard = await tx.customerFunnelCard.findFirst({
          where: {
            customerId: sale.customerId,
            active: true,
            stage: {
              in: ['CONTATO_QUENTE', 'EM_ANDAMENTO', 'NOVO_CONTATO', 'VENDA_CONCLUIDA'],
            },
          },
          orderBy: { updatedAt: 'desc' },
          select: { id: true },
        });

        if (currentCard) {
          await tx.customerFunnelCard.update({
            where: { id: currentCard.id },
            data: {
              stage: 'VENDA_CONCLUIDA',
              sellerNote: `Venda ${sale.id} finalizada`,
              active: true,
              archivedAt: null,
            },
          });
        } else {
          await tx.customerFunnelCard.create({
            data: {
              customerId: sale.customerId,
              stage: 'VENDA_CONCLUIDA',
              sellerNote: `Venda ${sale.id} finalizada`,
              active: true,
            },
          });
        }

        await tx.customerInteraction.create({
          data: {
            customerId: sale.customerId,
            type: 'CRM',
            content: `Card criado automaticamente em "Venda ou serviço Realizado" após venda ${sale.id}`,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'COMPLETE_SALE',
          module: 'SALES',
          entity: 'Sale',
          entityId: sale.id,
          userId,
          newValue: JSON.stringify({ status: SaleStatus.COMPLETED }),
        },
      });

      return updatedSale;
    });
  }
}
