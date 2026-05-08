import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(suppliers);
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
