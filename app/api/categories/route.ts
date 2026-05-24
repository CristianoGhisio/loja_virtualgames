
import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    const query = (searchParams.get('q') || '').trim();
    const onlyActive = searchParams.get('active');

    const where: Prisma.CategoryWhereInput = {};
    if (onlyActive === 'true') where.active = true;
    if (onlyActive === 'false') where.active = false;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return successResponse({
      data: categories,
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

    const body = await req.json();
    const { name, description, active = true } = body;

    if (!name) {
      return errorResponse('Nome é obrigatório', 400);
    }

    const existing = await prisma.category.findFirst({ where: { name } });
    if (existing) {
      return errorResponse('Categoria já existe', 409);
    }

    const slug = slugify(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        active,
      }
    });

    return successResponse(category, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
