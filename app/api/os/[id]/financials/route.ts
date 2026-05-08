
import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await params;

    const os = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        receivable: true, // The 1:1 linked receivable (likely the deposit or full payment)
      }
    });

    if (!os) {
      return errorResponse('OS not found', 404);
    }

    // Calculate totals
    const total = Number(os.total);
    
    // Check for any receivables linked to this OS (via ID)
    // Note: Due to 1:1 constraint, there's only one linked directly.
    // But we might have created others unlinked? For now, let's assume the linked one is the only "tracked" one.
    // If we implemented the "Split Payment" properly, we'd need to search for receivables by description or some other tag, 
    // but for this MVP, we rely on the logic that:
    // 1. If os.receivable exists AND is PAID -> That amount is paid.
    // 2. If it's PENDING, nothing is paid.
    
    let paid = 0;
    if (os.receivable && os.receivable.status === 'PAID') {
        paid = Number(os.receivable.value);
    }

    // Look for other receivables that might be related (e.g. by description containing OS ID)
    // This handles the "Final Payment" created by the delivery API which can't link to osId
    const otherReceivablesWhere = {
      description: { contains: `OS #${os.id.slice(-6).toUpperCase()}` },
      status: 'PAID' as const,
    } as {
      description: { contains: string };
      status: 'PAID';
      id?: { not: string };
    };
    if (os.receivable?.id) {
      otherReceivablesWhere.id = { not: os.receivable.id };
    }
    const otherReceivables = await prisma.receivable.findMany({
      where: otherReceivablesWhere,
    });

    const otherPaid = otherReceivables.reduce((acc, curr) => acc + Number(curr.value), 0);
    paid += otherPaid;

    const remaining = Math.max(0, total - paid);

    return successResponse({
      total,
      paid,
      remaining
    });

  } catch {
    return errorResponse('Erro ao carregar dados financeiros', 500);
  }
}
