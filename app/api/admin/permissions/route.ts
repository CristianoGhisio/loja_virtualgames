import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';


export const dynamic = 'force-dynamic';

const TOP_MENU_MODULE_PERMISSIONS = [
  { action: 'read', resource: 'dashboard', description: 'Acesso ao Dashboard' },
  { action: 'read', resource: 'cash-daily', description: 'Acesso ao Caixa Diário' },
  { action: 'read', resource: 'atendimento', description: 'Acesso ao Atendimento' },
  { action: 'read', resource: 'customers', description: 'Acesso aos Clientes' },
  { action: 'read', resource: 'employees', description: 'Acesso aos Funcionários' },
  { action: 'read', resource: 'registers', description: 'Acesso ao Controle (Cadastros)' },
  { action: 'read', resource: 'sales', description: 'Acesso a Vendas' },
  { action: 'read', resource: 'os', description: 'Acesso às OS' },
  { action: 'read', resource: 'financial', description: 'Acesso ao Financeiro' },
  { action: 'read', resource: 'reports', description: 'Acesso aos Relatórios' },
  { action: 'read', resource: 'admin', description: 'Acesso ao Admin' },
  { action: 'read', resource: 'settings', description: 'Acesso às Configurações' },
];

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    for (const permission of TOP_MENU_MODULE_PERMISSIONS) {
      await prisma.permission.upsert({
        where: {
          action_resource: {
            action: permission.action,
            resource: permission.resource,
          },
        },
        update: {
          description: permission.description,
        },
        create: permission,
      });
    }

    const financialPermission = await prisma.permission.findUnique({
      where: { action_resource: { action: 'read', resource: 'financial' } },
      select: { id: true },
    });
    const cashDailyPermission = await prisma.permission.findUnique({
      where: { action_resource: { action: 'read', resource: 'cash-daily' } },
      select: { id: true },
    });

    if (financialPermission?.id && cashDailyPermission?.id) {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { permissionId: financialPermission.id },
        select: { roleId: true },
      });

      for (const rolePermission of rolePermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: rolePermission.roleId,
              permissionId: cashDailyPermission.id,
            },
          },
          update: {},
          create: {
            roleId: rolePermission.roleId,
            permissionId: cashDailyPermission.id,
          },
        });
      }
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          select: {
            permissionId: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
    });

    return NextResponse.json({ roles, permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { roleId, permissionId, active } = await request.json();

    if (active) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId },
        },
        update: {},
        create: { roleId, permissionId },
      });
    } else {
      await prisma.rolePermission.deleteMany({
        where: { roleId, permissionId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating permission:', error);
    return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 });
  }
}
