import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    const query = (searchParams.get('q') || '').trim();

    const where: Prisma.AttributeWhereInput = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, attributes] = await Promise.all([
      prisma.attribute.count({ where }),
      prisma.attribute.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { name: 'asc' },
        ],
        include: {
          options: { orderBy: { order: 'asc' } },
        },
      }),
    ]);

    const normalized = attributes.map(attribute => ({
      ...attribute,
      options: attribute.options?.map(option => ({
        ...option,
        label: option.label ?? option.value,
      })),
    }));

    return successResponse({
      data: normalized,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
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
