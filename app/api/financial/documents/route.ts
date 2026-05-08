import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

const schema = z.object({
  action: z.enum(['issue_boleto', 'issue_nfe']),
  receivableIds: z.array(z.string()).min(1),
});

const makeCode = (seed: string) => seed.replace(/[^0-9]/g, '').slice(0, 44).padEnd(44, '0');

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const parsed = schema.parse(body);

    const receivables = await prisma.receivable.findMany({
      where: { id: { in: parsed.receivableIds } },
      include: { customer: true },
    });

    if (parsed.action === 'issue_boleto') {
      const boletos = receivables.map((item) => {
        const factor = `${item.id}${item.dueDate.toISOString().slice(0, 10).replace(/-/g, '')}`;
        const barcode = makeCode(factor);
        const digitableLine = `${barcode.slice(0, 5)}.${barcode.slice(5, 10)} ${barcode.slice(10, 15)}.${barcode.slice(15, 21)} ${barcode.slice(21, 26)}.${barcode.slice(26, 32)} ${barcode.slice(32, 33)} ${barcode.slice(33)}`;
        return {
          receivableId: item.id,
          payer: item.customer?.name ?? 'Consumidor final',
          dueDate: item.dueDate.toISOString(),
          amount: Number(item.value),
          barcode,
          digitableLine,
          status: 'ISSUED',
        };
      });
      return successResponse({ type: 'BOLETO', documents: boletos });
    }

    const nfes = receivables.map((item) => {
      const random = `${Date.now()}${Math.floor(Math.random() * 999999)}`;
      const accessKey = makeCode(`${random}${item.id}`);
      return {
        receivableId: item.id,
        customer: item.customer?.name ?? 'Consumidor final',
        issueDate: new Date().toISOString(),
        totalValue: Number(item.value),
        accessKey,
        status: 'AUTHORIZED',
      };
    });

    return successResponse({ type: 'NFE', documents: nfes });
  } catch (error) {
    return errorResponse(error);
  }
}
