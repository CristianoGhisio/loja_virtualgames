import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';
import { successResponse } from '@/lib/api-response';


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

    const where: Prisma.SupplierWhereInput = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { contact: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, suppliers] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return successResponse({
      data: suppliers,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Error fetching suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const json = await request.json();
    const supplier = await prisma.supplier.create({
      data: {
        name: json.name,
        contact: json.contact,
        phone: json.phone,
        active: json.active ?? true
      }
    });
    return NextResponse.json(supplier);
  } catch {
    return NextResponse.json({ error: 'Error creating supplier' }, { status: 500 });
  }
}
