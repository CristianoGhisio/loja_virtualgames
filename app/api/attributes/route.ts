import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const attributes = await prisma.attribute.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return successResponse(attributes);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const json = await req.json();
    
    // Simple validation
    if (!json.name || !json.slug) {
        return errorResponse('Nome e Slug são obrigatórios', 400);
    }

    const attribute = await prisma.attribute.create({
      data: {
        name: json.name,
        slug: json.slug,
        type: json.type || 'TEXT',
        entitySource: json.entitySource || 'NONE',
        marketplaceRequired: json.marketplaceRequired || false,
        options: {
          create: json.options?.map((opt: { value: string; label?: string; order?: number }, index: number) => ({
            value: opt.value,
            label: opt.label || opt.value,
            order: opt.order ?? index
          }))
        }
      },
      include: {
        options: true
      }
    });

    return successResponse(attribute, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
