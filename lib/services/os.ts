import { OSStatus } from '@prisma/client';
import { StockService } from './stock';
import { prisma } from '@/lib/prisma';

export class OSService {
  private static validTransitions: Record<OSStatus, OSStatus[]> = {
    ENTRADA: ['DIAGNOSTICO', 'CANCELADO'],
    DIAGNOSTICO: ['ORCAMENTO', 'CANCELADO'],
    ORCAMENTO: ['AGUARDANDO_APROVACAO', 'CANCELADO'],
    AGUARDANDO_APROVACAO: ['APROVADO', 'CANCELADO'],
    APROVADO: ['EM_REPARO', 'AGUARDANDO_PECA', 'CANCELADO'],
    AGUARDANDO_PECA: ['EM_REPARO', 'CANCELADO'],
    EM_REPARO: ['FINALIZADO', 'CANCELADO'],
    FINALIZADO: ['ENTREGUE'], // Cannot cancel after finished (usually)
    ENTREGUE: [],
    CANCELADO: [],
  };

  static async updateStatus(osId: string, newStatus: OSStatus, userId: string, notes?: string) {
    return await prisma.$transaction(async (tx) => {
      const os = await tx.serviceOrder.findUnique({
        where: { id: osId },
        include: { items: true },
      });
      if (!os) throw new Error("OS not found");

      // 1. Validate Transition (Relaxed for now to allow manual updates via UI)
      // const allowed = this.validTransitions[os.status];
      // if (!allowed.includes(newStatus)) {
      //   throw new Error(`Invalid status transition from ${os.status} to ${newStatus}`);
      // }

      // 2. Handle Status Specific Logic
      // Removed stock deduction from EM_REPARO to avoid double deduction and align with delivery
      
      if (newStatus === 'ENTREGUE' && os.status !== 'ENTREGUE') {
        // 1. Deduct parts from stock upon delivery/finalization (idempotente)
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
              `OS #${os.id} Delivered`,
              os.id,
              userId,
              tx
            );
          }
        }

        // 2. Generate Receivable (Moved from FINALIZADO to ENTREGUE or kept at FINALIZADO depending on flow)
        // If we consider FINALIZADO as "Technically Done" and ENTREGUE as "Customer Picked Up & Paid"
        // Let's generate receivable here if not already generated.
        
        // Check if receivable already exists
        const existingReceivable = await tx.receivable.findFirst({ where: { serviceOrderId: os.id } });
        
        if (!existingReceivable) {
            const revenueCostCenter = await tx.costCenter.findFirst({ where: { type: 'REVENUE' } });
            
            await tx.receivable.create({
              data: {
                description: `OS #${os.id} - ${os.device}`,
                origin: 'SERVICE',
                value: os.total,
                dueDate: new Date(),
                status: 'PENDING', // Will be updated to PAID in frontend flow
                serviceOrderId: os.id,
                customerId: os.customerId,
                costCenterId: revenueCostCenter?.id,
              },
            });
        }
      }

      if (newStatus === 'FINALIZADO' && os.status !== 'FINALIZADO') {
         // Logic for FINALIZADO (Technical completion)
         // We can leave receivable generation here OR move to ENTREGUE.
         // Request says: "no momento em que for entregar para o cliente, deve aparecer uma forma de Resumo financeiro"
         // So let's ensure stock is deducted at ENTREGUE (Delivery).
         // If we move stock deduction to ENTREGUE, we solve the "double deduction" on repair resume.
      }

      // 3. Update OS
      const updatedOS = await tx.serviceOrder.update({
        where: { id: osId },
        data: {
          status: newStatus,
          endDate: newStatus === 'FINALIZADO' ? new Date() : undefined,
        },
      });

      // 4. Log History
      await tx.serviceOrderHistory.create({
        data: {
          serviceOrderId: osId,
          status: newStatus,
          notes,
          userId,
        },
      });

      return updatedOS;
    });
  }
}
