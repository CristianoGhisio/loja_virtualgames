import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;
    const supplier = await prisma.supplier.findUnique({
      where: { id }
    });
    
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    
    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ error: 'Error fetching supplier' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;
    const json = await request.json();
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: json.name,
        contact: json.contact,
        phone: json.phone,
        email: json.email,
        document: json.document,
        active: json.active
      }
    });
    return NextResponse.json(supplier);
  } catch {
    return NextResponse.json({ error: 'Error updating supplier' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;
    await prisma.supplier.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error deleting supplier' }, { status: 500 });
  }
}
