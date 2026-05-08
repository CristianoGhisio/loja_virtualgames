import { NextResponse } from 'next/server';
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await request.json();

    const duplicate = await prisma.category.findFirst({
      where: {
        name: json.name,
        id: { not: id }
      }
    });
    if (duplicate) {
      return NextResponse.json({ error: 'Categoria já existe' }, { status: 400 });
    }
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: json.name,
        slug: slugify(json.name),
        description: json.description || null,
        active: json.active,
      }
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error('API Error /categories/[id] PUT:', error);
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const productsCount = await prisma.product.count({
      where: {
        categoryId: id
      }
    });

    if (productsCount > 0) {
      return NextResponse.json({ error: 'Categoria possui produtos vinculados' }, { status: 400 });
    }

    await prisma.subcategory.deleteMany({
      where: { categoryId: id }
    });

    await prisma.category.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error /categories/[id] DELETE:', error);
    return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 });
  }
}
