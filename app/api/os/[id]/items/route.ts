
import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const itemSchema = z.object({
  type: z.enum(['PART', 'SERVICE']),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;
    const body = await req.json();
    const { type, productId, serviceId, quantity, unitPrice } = itemSchema.parse(body);

    // 1. Validate Product/Service existence
    let name = '';
    let costPrice = 0;
    let warrantyMonths = 0;

    if (type === 'PART') {
      if (!productId) throw new Error('Product ID required for PART');
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { stock: true }
      });
      if (!product) throw new Error('Product not found');
      name = product.commercialName;
      costPrice = product.stock ? Number(product.stock.averageCost) : 0;
      warrantyMonths = Math.max(0, Number(product.warrantyMonths ?? 0));

      // We don't block by stock here yet, as per requirement "waiting for part"
    } else {
      if (!serviceId) throw new Error('Service ID required for SERVICE');
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) throw new Error('Service not found');
      name = service.name;
      warrantyMonths = Math.max(0, Number(service.warrantyMonths ?? 0));
    }

    // 2. Add Item to OS
    const item = await prisma.serviceOrderItem.create({
      data: {
        serviceOrderId: id,
        type,
        productId,
        serviceId,
        name,
        quantity,
        unitPrice,
        costPrice,
        warrantyMonths,
        total: quantity * unitPrice,
      },
    });

    // 3. Update OS Totals
    // Recalculate all totals to be safe
    const allItems = await prisma.serviceOrderItem.findMany({ where: { serviceOrderId: id } });

    const totalParts = allItems
      .filter(i => i.type === 'PART')
      .reduce((acc, i) => acc + Number(i.total), 0);

    const totalServices = allItems
      .filter(i => i.type === 'SERVICE')
      .reduce((acc, i) => acc + Number(i.total), 0);

    const total = totalParts + totalServices;

    await prisma.serviceOrder.update({
      where: { id },
      data: {
        totalParts,
        totalServices,
        total,
      },
    });

    return successResponse(item);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE() {
  return errorResponse(new Error('Use specific item endpoint'), 405);
}
