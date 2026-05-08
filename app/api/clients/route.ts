import { NextRequest, NextResponse } from 'next/server';
import { CustomerType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';


export const dynamic = 'force-dynamic';

interface ClientPayload {
  name: string;
  email?: string;
  document?: string;
  type: string;
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim();
  const normalizedQuery = query.toLowerCase();
  const digitsQuery = query.replace(/\D/g, '');

  try {
    const clients = await prisma.customer.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 120,
    });

    if (!query) {
      return NextResponse.json(clients);
    }

    const filtered = clients.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(normalizedQuery);
      const emailMatch = (client.email ?? '').toLowerCase().includes(normalizedQuery);
      const documentMatch = client.document.toLowerCase().includes(normalizedQuery);
      const phoneMatch = (client.phone ?? '').toLowerCase().includes(normalizedQuery);

      if (nameMatch || emailMatch || documentMatch || phoneMatch) {
        return true;
      }

      if (!digitsQuery) {
        return false;
      }

      const documentDigits = client.document.replace(/\D/g, '');
      const phoneDigits = (client.phone ?? '').replace(/\D/g, '');
      return documentDigits.includes(digitsQuery) || phoneDigits.includes(digitsQuery);
    });

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('GET /api/clients error:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { message: 'Erro ao listar clientes', error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = (await request.json()) as ClientPayload;
    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const email = body.email?.trim() || undefined;
    const document = body.document?.trim();

    if (!name) {
      return NextResponse.json(
        { message: 'Nome é obrigatório' },
        { status: 400 },
      );
    }

    if (!phone && !email && !document) {
      return NextResponse.json(
        { message: 'Informe ao menos telefone, email ou documento' },
        { status: 400 },
      );
    }

    const fallbackDocument = `CF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const safeDocument = document || fallbackDocument;

    const typeValue = body.type && Object.values(CustomerType).includes(body.type as CustomerType)
      ? (body.type as CustomerType)
      : CustomerType.PF;

    const client = await prisma.customer.create({
      data: {
        name,
        email,
        document: safeDocument,
        type: typeValue,
        phone,
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
        action: 'CLIENT_CREATE',
        module: 'customers',
        entity: 'Client',
        entityId: client.id,
        ip,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients error:', error);
    return NextResponse.json(
      { message: 'Erro ao criar cliente' },
      { status: 500 },
    );
  }
}
