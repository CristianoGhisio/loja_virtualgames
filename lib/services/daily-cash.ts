import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type CashClient = Prisma.TransactionClient | typeof prisma;

type DailyCashStatus = {
  isOpen: boolean;
  status: 'ABERTO' | 'FECHADO';
  lastOpenAt: string | null;
  lastCloseAt: string | null;
};

const OPEN_MARKER = '[ABERTURA]';
const CLOSE_MARKER = '[FECHAMENTO]';

export async function getDailyCashStatus(client: CashClient = prisma): Promise<DailyCashStatus> {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const entries = await client.cashMovement.findMany({
    where: {
      date: { gte: start, lte: end },
      OR: [
        { description: { contains: OPEN_MARKER } },
        { description: { contains: CLOSE_MARKER } },
      ],
    },
    orderBy: { date: 'asc' },
    select: {
      date: true,
      description: true,
    },
  });

  let lastOpenAt: Date | null = null;
  let lastCloseAt: Date | null = null;

  for (const entry of entries) {
    if (entry.description?.includes(OPEN_MARKER)) {
      lastOpenAt = entry.date;
    }
    if (entry.description?.includes(CLOSE_MARKER)) {
      lastCloseAt = entry.date;
    }
  }

  const isOpen = Boolean(lastOpenAt && (!lastCloseAt || lastOpenAt > lastCloseAt));

  return {
    isOpen,
    status: isOpen ? 'ABERTO' : 'FECHADO',
    lastOpenAt: lastOpenAt ? lastOpenAt.toISOString() : null,
    lastCloseAt: lastCloseAt ? lastCloseAt.toISOString() : null,
  };
}

export async function ensureDailyCashOpen(client: CashClient = prisma): Promise<void> {
  const cashStatus = await getDailyCashStatus(client);
  if (!cashStatus.isOpen) {
    throw new Error('Caixa diário fechado. Abra o caixa diário para continuar.');
  }
}
