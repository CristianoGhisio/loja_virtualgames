import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await request.json();

    const duplicate = await prisma.manufacturer.findFirst({
      where: {
        name: json.name,
        id: { not: id }
      }
    });
    if (duplicate) {
      return NextResponse.json({ error: 'Fabricante já existe' }, { status: 400 });
    }

    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: {
        name: json.name,
        slug: slugify(json.name),
        website: json.website || null,
        active: json.active,
      }
    });
    return NextResponse.json(manufacturer);
  } catch (error) {
    console.error('API Error /manufacturers/[id] PUT:', error);
    return NextResponse.json({ error: 'Erro ao atualizar fabricante' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const productsCount = await prisma.product.count({
      where: { manufacturerId: id }
    });
    if (productsCount > 0) {
      return NextResponse.json({ error: 'Fabricante possui produtos vinculados' }, { status: 400 });
    }

    await prisma.manufacturer.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error /manufacturers/[id] DELETE:', error);
    return NextResponse.json({ error: 'Erro ao excluir fabricante' }, { status: 500 });
  }
}
