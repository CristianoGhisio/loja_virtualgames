import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { createAuditLog } from '@/lib/audit';
import { checkAuth } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-response';

const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  roleId: z.string().min(1, 'Perfil é obrigatório'),
});

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await request.json();
    const { name, email, password, roleId } = createUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(new Error('Usuário já existe'), 400);
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        roleId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });

    await createAuditLog({
      action: `Criou usuário ${user.name}`,
      module: 'ADMIN',
      entity: 'User',
      entityId: user.id,
      newValue: { name: user.name, email: user.email, role: user.role.name },
    });

    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error);
  }
}
