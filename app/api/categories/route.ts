
import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    return successResponse(categories);
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
