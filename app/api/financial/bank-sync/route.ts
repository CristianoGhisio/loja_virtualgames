import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  fileContent: z.string().min(3),
  autoConciliate: z.boolean().optional(),
});

type ImportedStatement = {
  id: string;
  date: Date;
  description: string;
  value: number;
};

const scoreMatch = (statement: ImportedStatement, system: { id: string; paidAt: Date | null; netValue: number; customer: string }) => {
  let score = 0;
  const dateDiff = system.paidAt ? Math.abs((statement.date.getTime() - system.paidAt.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  const valueDiff = Math.abs(statement.value - system.netValue);
  if (dateDiff <= 1) score += 50;
  else if (dateDiff <= 3) score += 30;
  else if (dateDiff <= 7) score += 10;
  if (valueDiff <= 0.01) score += 40;
  else if (valueDiff <= 5) score += 20;
  if (statement.description.toLowerCase().includes(system.customer.toLowerCase().slice(0, 6))) score += 10;
  return score;
};

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const parsed = schema.parse(body);

    const lines = parsed.fileContent
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const imported: ImportedStatement[] = lines.slice(1).map((line, index) => {
      const [dateRaw, descriptionRaw, valueRaw] = line.split(';');
      return {
        id: `stmt-${index + 1}`,
        date: dateRaw ? new Date(dateRaw) : new Date(),
        description: descriptionRaw ?? `Linha ${index + 1}`,
        value: Number((valueRaw ?? '0').replace(',', '.')),
      };
    });

    const paidCard = await prisma.receivable.findMany({
      where: {
        status: 'PAID',
        paymentMethod: { in: ['CARTAO', 'CREDITO', 'DEBITO'] },
      },
      include: { customer: true },
      orderBy: { paidAt: 'desc' },
      take: 500,
    });

    const systemRows = paidCard.map((row) => ({
      id: row.id,
      paidAt: row.paidAt,
      netValue: Number(row.netValue ?? row.value),
      customer: row.customer?.name ?? 'consumidor final',
    }));

    const matches = imported.map((statement) => {
      const candidates = systemRows
        .map((system) => ({
          systemId: system.id,
          score: scoreMatch(statement, system),
          netValue: system.netValue,
        }))
        .sort((a, b) => b.score - a.score);
      const best = candidates[0];
      return {
        statementId: statement.id,
        description: statement.description,
        date: statement.date.toISOString(),
        value: statement.value,
        suggestedSystemId: best && best.score >= 60 ? best.systemId : null,
        score: best?.score ?? 0,
      };
    });

    const autoConciliated = parsed.autoConciliate
      ? matches.filter((item) => item.suggestedSystemId && item.score >= 80).length
      : 0;

    return successResponse({
      imported: imported.length,
      matched: matches.filter((item) => item.suggestedSystemId).length,
      autoConciliated,
      rows: matches,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
