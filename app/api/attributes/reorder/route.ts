import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const json = await req.json();
    const { items } = json;

    if (!Array.isArray(items)) {
      return errorResponse(new Error('Items array is required'), 400);
    }

    const normalizedItems = items
      .filter((item: unknown): item is { id: string; order: number } => {
        if (!item || typeof item !== 'object') return false;
        const row = item as { id?: unknown; order?: unknown };
        return typeof row.id === 'string' && row.id.trim().length > 0 && Number.isFinite(Number(row.order));
      })
      .map((item) => ({ id: item.id.trim(), order: Number(item.order) }));

    if (normalizedItems.length === 0) {
      return errorResponse(new Error('Nenhum item válido para reordenação'), 400);
    }

    await prisma.$transaction(async (tx) => {
      for (const item of normalizedItems) {
        await tx.attribute.updateMany({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
