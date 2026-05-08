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
    const interactions = await prisma.supplierInteraction.findMany({
      where: { supplierId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Error fetching interactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;
    const json = await request.json();
    const interaction = await prisma.supplierInteraction.create({
      data: {
        supplierId: id,
        type: json.type,
        content: json.content,
      },
    });
    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json(
      { error: 'Error creating interaction' },
      { status: 500 }
    );
  }
}
