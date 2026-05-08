
import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
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

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const where: Prisma.ManufacturerWhereInput = { active: true };
    if (categoryId) {
      where.products = {
        some: {
          categoryId
        }
      };
    }

    const manufacturers = await prisma.manufacturer.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return successResponse(manufacturers);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const { name, website, active = true } = body;

    if (!name) {
      return errorResponse('Nome é obrigatório', 400);
    }

    const existing = await prisma.manufacturer.findFirst({ where: { name } });
    if (existing) {
      return errorResponse('Fabricante já existe', 409);
    }

    const manufacturer = await prisma.manufacturer.create({
      data: {
        name,
        slug: slugify(name),
        website: website || null,
        active,
      },
    });

    return successResponse(manufacturer, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
