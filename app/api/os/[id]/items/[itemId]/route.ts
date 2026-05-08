
import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id, itemId } = await params;

    // Verify item belongs to OS
    const item = await prisma.serviceOrderItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.serviceOrderId !== id) {
      return errorResponse(new Error('Item not found or does not belong to this OS'), 404);
    }

    await prisma.serviceOrderItem.delete({
      where: { id: itemId },
    });

    // Recalculate Totals
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

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
