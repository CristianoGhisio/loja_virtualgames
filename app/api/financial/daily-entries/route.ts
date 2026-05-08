import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkAuth, hasApiPermission } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

const parseDescription = (description: string) => {
  const parts = description.split('|');
  if (parts.length < 3) {
    return { category: 'Geral', account: 'Caixa', note: description };
  }
  return {
    category: parts[0].replace('CAT:', ''),
    account: parts[1].replace('ACC:', ''),
    note: parts.slice(2).join('|').replace('DESC:', ''),
  };
};

const deriveEntryMeta = (entry: {
  description: string | null;
  receivableId: string | null;
  payableId: string | null;
  receivable: { saleId: string | null; serviceOrderId: string | null } | null;
}) => {
  if (entry.receivableId) {
    if (entry.receivable?.saleId) {
      return {
        category: 'Vendas',
        account: 'Contas a Receber',
        note: entry.description ?? `Recebimento venda ${entry.receivable.saleId}`,
      };
    }
    if (entry.receivable?.serviceOrderId) {
      return {
        category: 'Serviços',
        account: 'Contas a Receber',
        note: entry.description ?? `Recebimento serviço ${entry.receivable.serviceOrderId}`,
      };
    }
    return {
      category: 'Recebimentos',
      account: 'Contas a Receber',
      note: entry.description ?? 'Recebimento',
    };
  }

  if (entry.payableId) {
    return {
      category: 'Despesas',
      account: 'Contas a Pagar',
      note: entry.description ?? 'Pagamento',
    };
  }

  return parseDescription(entry.description ?? '');
};

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const now = new Date();
    const startDate = start ? new Date(start) : new Date(now.setHours(0, 0, 0, 0));
    const endDate = end ? new Date(end) : new Date(new Date().setHours(23, 59, 59, 999));

    const entries = await prisma.cashMovement.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      include: {
        receivable: {
          select: {
            saleId: true,
            serviceOrderId: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const normalized = entries.map((entry) => {
      const parsed = deriveEntryMeta(entry);
      return {
        ...entry,
        ...parsed,
        canEdit: entry.receivableId === null && entry.payableId === null,
        canDelete: entry.receivableId === null && entry.payableId === null,
      };
    });

    return successResponse(normalized);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;
    if (!hasApiPermission(user, 'financial', 'write')) {
      return errorResponse(new Error('Permissão negada'), 403);
    }

    const body = await req.json();
    const action = body.action as string | undefined;

    if (action === 'delete') {
      const schema = z.object({
        action: z.literal('delete'),
        id: z.string(),
      });
      const parsed = schema.parse(body);

      const targetEntry = await prisma.cashMovement.findUnique({
        where: { id: parsed.id },
        select: { receivableId: true, payableId: true },
      });

      if (!targetEntry || targetEntry.receivableId || targetEntry.payableId) {
        return errorResponse(new Error('Registro automático não pode ser removido'), 400);
      }

      await prisma.cashMovement.delete({ where: { id: parsed.id } });
      return successResponse({ success: true });
    }

    if (action === 'update') {
      const schema = z.object({
        action: z.literal('update'),
        id: z.string(),
        date: z.string(),
        description: z.string().min(3),
        category: z.string().min(2),
        account: z.string().min(2),
        value: z.number().min(0),
        type: z.enum(['ENTRADA', 'SAIDA']),
      });
      const parsed = schema.parse(body);

      const targetEntry = await prisma.cashMovement.findUnique({
        where: { id: parsed.id },
        select: { receivableId: true, payableId: true },
      });

      if (!targetEntry || targetEntry.receivableId || targetEntry.payableId) {
        return errorResponse(new Error('Registro automático não pode ser editado'), 400);
      }

      await prisma.cashMovement.update({
        where: { id: parsed.id },
        data: {
          date: new Date(parsed.date),
          description: `CAT:${parsed.category}|ACC:${parsed.account}|DESC:${parsed.description}`,
          value: parsed.value,
          type: parsed.type === 'ENTRADA' ? 'IN' : 'OUT',
          userId: user?.id,
        },
      });
      return successResponse({ success: true });
    }

    const schema = z.object({
      date: z.string(),
      description: z.string().min(3),
      category: z.string().min(2),
      account: z.string().min(2),
      value: z.number().min(0),
      type: z.enum(['ENTRADA', 'SAIDA']),
    });
    const parsed = schema.parse(body);

    await prisma.cashMovement.create({
      data: {
        date: new Date(parsed.date),
        description: `CAT:${parsed.category}|ACC:${parsed.account}|DESC:${parsed.description}`,
        value: parsed.value,
        type: parsed.type === 'ENTRADA' ? 'IN' : 'OUT',
        userId: user?.id,
      },
    });

    return successResponse({ success: true }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
