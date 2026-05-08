import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';
import { createAuditLog } from '@/lib/audit';


export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;

    const { id } = await context.params;
    const body = await request.json();

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { active: body.active },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        active: true,
        role: true,
      },
    });

    const action = body.active ? 'Desbloqueou usuário' : 'Bloqueou usuário';
    await createAuditLog({
      action: `${action} ${updatedUser.name}`,
      module: 'ADMIN',
      entity: 'User',
      entityId: id,
      oldValue: { active: existingUser.active },
      newValue: { active: updatedUser.active },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json({ error: 'Falha ao alterar status do usuário.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;

    const { id } = await context.params;

    // Impede deletar a si mesmo (Admin atual)
    if (user?.id === id) {
      return NextResponse.json({ error: 'Você não pode excluir seu próprio usuário.' }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id }
    });

    await createAuditLog({
      action: `Excluiu usuário ${userToDelete.name}`,
      module: 'ADMIN',
      entity: 'User',
      entityId: id,
      oldValue: { name: userToDelete.name, email: userToDelete.email },
    });

    return NextResponse.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Falha ao excluir usuário.' }, { status: 500 });
  }
}
