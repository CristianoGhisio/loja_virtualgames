import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;
    const json = await req.json();

    // Transaction to update attribute and replace options
    const attribute = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.attribute.update({
        where: { id },
        data: {
          name: json.name,
          slug: json.slug,
          type: json.type,
          entitySource: json.entitySource,
          marketplaceRequired: json.marketplaceRequired,
        }
      });

      // 2. If type is LIST, handle options
      if (json.type === 'LIST' && Array.isArray(json.options)) {
        // Delete existing options
        await tx.attributeOption.deleteMany({
          where: { attributeId: id }
        });

        // Create new options
        if (json.options.length > 0) {
          await tx.attributeOption.createMany({
            data: json.options.map((opt: { value: string; label?: string; order?: number }, index: number) => ({
              attributeId: id,
              value: opt.value,
              label: opt.label || opt.value,
              order: opt.order ?? index
            }))
          });
        }
      }

      return tx.attribute.findUnique({
        where: { id },
        include: { options: { orderBy: { order: 'asc' } } }
      });
    });

    return successResponse(attribute);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;

    await prisma.attribute.delete({
      where: { id },
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
