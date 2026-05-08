import { NextRequest, NextResponse } from 'next/server';
import { CustomerType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkAuth, hasApiPermission } from '@/lib/api-auth';


export const dynamic = 'force-dynamic';

interface ClientPayload {
  name?: string;
  email?: string;
  document?: string;
  type?: string;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

function getClientIp(request: NextRequest): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim();
  }
  return request.headers.get('x-real-ip') ?? undefined;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const client = await prisma.customer.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { message: 'Cliente não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error(`GET /api/clients/${id} error:`, error);
    return NextResponse.json(
      { message: 'Erro ao buscar cliente' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as ClientPayload;

    const typeValue = body.type && Object.values(CustomerType).includes(body.type as CustomerType)
      ? (body.type as CustomerType)
      : undefined;

    const client = await prisma.customer.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        document: body.document,
        type: typeValue,
        phone: body.phone,
        zipCode: body.cep,
        street: body.street,
        number: body.number,
        complement: body.complement,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
      },
    });

    const ip = getClientIp(request);

    await prisma.auditLog.create({
      data: {
        action: 'CLIENT_UPDATE',
        module: 'customers',
        entity: 'Client',
        entityId: client.id,
        ip,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error(`PUT /api/clients/${id} error:`, error);
    return NextResponse.json(
      { message: 'Erro ao atualizar cliente' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { authorized, response, user } = await checkAuth();
  if (!authorized) return response;

  if (!hasApiPermission(user, 'customers', 'delete')) {
    return NextResponse.json(
      { message: 'Sem permissão para excluir clientes' },
      { status: 403 },
    );
  }

  const { id } = await context.params;

  try {
    const client = await prisma.customer.delete({
      where: { id },
    });

    const ip = getClientIp(request);

    await prisma.auditLog.create({
      data: {
        action: 'CLIENT_DELETE',
        module: 'customers',
        entity: 'Client',
        entityId: client.id,
        ip,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error(`DELETE /api/clients/${id} error:`, error);
    return NextResponse.json(
      { message: 'Erro ao excluir cliente' },
      { status: 500 },
    );
  }
}
