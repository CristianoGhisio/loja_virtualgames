import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const statusLabel: Record<string, string> = {
    PENDING: 'Em Andamento',
    COMPLETED: 'Finalizada',
    CANCELLED: 'Cancelada',
  };

  const { id } = await context.params;
  try {
    const sales = await prisma.sale.findMany({
      where: { customerId: id },
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    const formatted = sales.map((sale) => ({
      id: sale.id,
      date: sale.date,
      itemsCount: sale._count.items,
      total: Number(sale.total),
      status: statusLabel[sale.status] ?? sale.status,
    }));

    return NextResponse.json(formatted);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}
