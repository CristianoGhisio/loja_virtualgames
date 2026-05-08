import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await request.json();
    const rawName = typeof body.name === 'string' ? body.name.trim() : '';
    const rawDescription = typeof body.description === 'string' ? body.description.trim() : '';

    if (!rawName) {
      return NextResponse.json({ error: 'Nome do perfil é obrigatório' }, { status: 400 });
    }

    const existingRole = await prisma.role.findUnique({
      where: { name: rawName.toUpperCase() },
    });

    if (existingRole) {
      return NextResponse.json({ error: 'Perfil já existe' }, { status: 400 });
    }

    const role = await prisma.role.create({
      data: {
        name: rawName.toUpperCase(),
        description: rawDescription || null,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do perfil é obrigatório' }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (role._count.users > 0) {
      return NextResponse.json(
        { error: 'Perfil com usuários vinculados não pode ser removido' },
        { status: 409 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
