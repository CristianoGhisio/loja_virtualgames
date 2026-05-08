
import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;

    const os = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
             // If we had a relation to User in history, we'd include it. 
             // The schema says `userId String?` but no relation defined in History model?
             // Let's check schema again. 
             // Model ServiceOrderHistory has `userId String?` but NO relation to User model.
             // Wait, I should check if I can fetch the user name manually or if I should update schema.
             // For now, I'll just fetch the ID.
          }
        },
        technician: true,
      },
    });

    if (!os) {
      return errorResponse(new Error('OS not found'), 404);
    }

    return successResponse(os);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;
    const body = await _req.json();

    // specific schema for updating OS details (not just status)
    const schema = z.object({
      technicianId: z.string().optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
      notes: z.string().optional(),
      report: z.string().optional(),
      // Add other editable fields here
    });

    const parsed = schema.parse(body);

    const updatedOS = await prisma.serviceOrder.update({
      where: { id },
      data: parsed,
    });

    return successResponse(updatedOS);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;

    const os = await prisma.serviceOrder.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        receivable: {
          select: { id: true },
        },
      },
    });

    if (!os) {
      return errorResponse(new Error('OS not found'), 404);
    }

    if (os.status !== 'ENTRADA') {
      return errorResponse(new Error('Apenas OS na fila de entrada podem ser excluídas'), 400);
    }

    await prisma.$transaction(async (tx) => {
      if (os.receivable?.id) {
        await tx.cashMovement.deleteMany({
          where: { receivableId: os.receivable.id },
        });
        await tx.receivable.delete({
          where: { id: os.receivable.id },
        });
      }

      await tx.serviceOrder.delete({
        where: { id: os.id },
      });
    });

    return successResponse({ deleted: true, id: os.id });
  } catch (error) {
    return errorResponse(error);
  }
}
