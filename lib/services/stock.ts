import type { Prisma, StockMovementType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class StockService {
  /**
   * Register a stock movement and update product stock atomically.
   * Can be part of a larger transaction if tx is provided.
   */
  static async moveStock(
    productId: string,
    quantity: number,
    type: StockMovementType,
    reason: string,
    referenceId?: string,
    userId?: string,
    tx?: Prisma.TransactionClient,
    unitCost?: number,
    salePrice?: number
  ) {
    const db = tx || prisma;

    // 1. Validate input
    if (quantity <= 0) throw new Error("Quantity must be positive");

    // 2. Determine operation (Add or Subtract)
    let adjustment = 0;
    const isEntry = ['IN_PURCHASE', 'IN_RETURN', 'IN_ADJUSTMENT'].includes(type);
    
    switch (type) {
      case 'IN_PURCHASE':
      case 'IN_RETURN':
      case 'IN_ADJUSTMENT':
        adjustment = quantity;
        break;
      case 'OUT_SALE':
      case 'OUT_WARRANTY':
      case 'OUT_LOSS':
      case 'OUT_ADJUSTMENT':
      case 'OUT_SERVICE_PART':
        adjustment = -quantity;
        break;
    }

    // 3. Fetch current product state (needed for PMP)
    const currentProduct = await db.product.findUnique({
      where: { id: productId },
      include: { stock: true }
    });

    if (!currentProduct) throw new Error("Product not found");

    let newAverageCost = Number(currentProduct.stock?.averageCost || 0);
    const currentQty = currentProduct.stock?.quantity || 0;

    // 4. Calculate PMP (Weighted Average Cost)
    // Formula: ((CurrentQty * CurrentAvg) + (EntryQty * EntryCost)) / (CurrentQty + EntryQty)
    if (isEntry && unitCost !== undefined && unitCost > 0) {
      const totalValueBefore = currentQty * newAverageCost;
      const entryValue = quantity * unitCost;
      const newTotalQty = currentQty + quantity;
      
      if (newTotalQty > 0) {
        newAverageCost = (totalValueBefore + entryValue) / newTotalQty;
      }
    }

    // 5. Execute Transaction
    const movement = await db.stockMovement.create({
      data: {
        productId,
        quantity,
        type,
        reason,
        referenceId,
        createdBy: userId,
        unitCost: unitCost ? unitCost : undefined,
        resultingAverageCost: newAverageCost
      },
    });

    const product = await db.product.update({
      where: { id: productId },
      data: {
        stock: {
          upsert: {
            create: {
              quantity: quantity,
              averageCost: newAverageCost,
              totalValue: newAverageCost * quantity
            },
            update: {
              quantity: { increment: adjustment },
              averageCost: newAverageCost,
              totalValue: (currentQty + adjustment) * newAverageCost
            }
          }
        },
      },
      include: { stock: true }
    });

    if (isEntry && salePrice !== undefined && salePrice > 0) {
      await db.product.update({
        where: { id: productId },
        data: { price: salePrice },
      });
    }

    // 6. Validate negative stock (Optional: could allow negative if configured)
    if (product.stock && product.stock.quantity < 0) {
      // Revert if negative stock is not allowed
      // Note: Since we are inside a transaction (potentially), throwing error rolls back everything.
      // However, if we allow negative stock, we just log a warning.
      // For now, let's block it as per requirements.
      throw new Error(`Insufficient stock for product ${product.commercialName}. Available: ${currentQty}, Required: ${quantity}`);
    }

    return movement;
  }
}
