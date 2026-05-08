import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';


export const dynamic = 'force-dynamic';

const STAGES = ['NOVO_CONTATO', 'EM_ANDAMENTO', 'CONTATO_QUENTE', 'VENDA_CONCLUIDA', 'FEEDBACK_REALIZADO', 'FINALIZADO'] as const;

type FunnelStage = (typeof STAGES)[number];

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const cards = await prisma.$queryRaw<Array<{
      id: string;
      customerId: string;
      stage: FunnelStage;
      sellerNote: string | null;
      itemInterest: string | null;
      active: boolean;
      hasNewMessage: boolean;
      archivedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      lastStageChangeAt: Date;
      customerName: string;
      customerPhone: string | null;
    }>>(Prisma.sql`
      SELECT
        cfc."id",
        cfc."customerId",
        cfc."stage"::text as "stage",
        cfc."sellerNote",
        cfc."itemInterest",
        cfc."active",
        cfc."hasNewMessage",
        cfc."archivedAt",
        cfc."createdAt",
        cfc."updatedAt",
        cfc."lastStageChangeAt",
        c."name" as "customerName",
        c."phone" as "customerPhone"
      FROM "CustomerFunnelCard" cfc
      INNER JOIN "Customer" c ON c."id" = cfc."customerId"
      WHERE cfc."active" = true
      ORDER BY cfc."updatedAt" DESC
    `);

    const cardIds = cards.map((card) => card.id);
    let flowRows: Array<{
      funnelCardId: string;
      kind: string;
      status: string;
    }> = [];

    if (cardIds.length > 0) {
      try {
        flowRows = await prisma.$queryRaw<Array<{
          funnelCardId: string;
          kind: string;
          status: string;
        }>>(Prisma.sql`
          SELECT
            cif."funnelCardId",
            cif."kind",
            cif."status"
          FROM "CustomerInterestFlow" cif
          WHERE cif."funnelCardId" IN (${Prisma.join(cardIds)})
        `);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('CustomerInterestFlow')) {
          throw error;
        }
      }
    }

    const flowByCard = new Map<string, { productFlowStatus: string; serviceFlowStatus: string }>();
    for (const row of flowRows) {
      const current = flowByCard.get(row.funnelCardId) ?? {
        productFlowStatus: 'PENDING',
        serviceFlowStatus: 'PENDING',
      };
      if (row.kind === 'PRODUCT') {
        current.productFlowStatus = row.status;
      }
      if (row.kind === 'SERVICE') {
        current.serviceFlowStatus = row.status;
      }
      flowByCard.set(row.funnelCardId, current);
    }

    const enriched = cards.map((card) => {
      const flow = flowByCard.get(card.id);
      return {
        ...card,
        productFlowStatus: flow?.productFlowStatus ?? null,
        serviceFlowStatus: flow?.serviceFlowStatus ?? null,
      };
    });

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch atendimento cards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await request.json();
    const stage = STAGES.includes(body.stage) ? (body.stage as FunnelStage) : 'NOVO_CONTATO';

    const result = await prisma.$transaction(async (tx) => {
      let customerId = body.customerId as string | undefined;
      let customerName = '';

      if (!customerId) {
        const contactName = String(body.name || '').trim();
        const contactPhone = String(body.whatsapp || '').trim();

        if (!contactName || !contactPhone) {
          throw new Error('Nome e WhatsApp são obrigatórios para novo contato');
        }

        const generatedDocument = `LEAD-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

        const customer = await tx.customer.create({
          data: {
            name: contactName,
            phone: normalizePhone(contactPhone),
            document: generatedDocument,
            type: 'PF',
            active: true,
          },
        });

        customerId = customer.id;
        customerName = customer.name;
      } else {
        const customer = await tx.customer.findUnique({
          where: { id: customerId },
          select: { id: true, name: true },
        });

        if (!customer) {
          throw new Error('Customer not found');
        }

        customerName = customer.name;
      }

      const cardId = crypto.randomUUID();
      const sellerNote = body.sellerNote ? String(body.sellerNote).trim() : null;
      const itemInterest = body.itemInterest ? String(body.itemInterest).trim() : null;

      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "CustomerFunnelCard"
          ("id", "customerId", "stage", "sellerNote", "itemInterest", "active", "createdAt", "updatedAt", "lastStageChangeAt")
        VALUES
          (${cardId}, ${customerId}, ${stage}::"FunnelStage", ${sellerNote}, ${itemInterest}, true, NOW(), NOW(), NOW())
      `);

      await tx.customerInteraction.create({
        data: {
          customerId,
          type: 'CRM',
          content: `Card de atendimento criado em ${stage} para ${customerName}`,
        },
      });

      return { id: cardId, customerId, stage, sellerNote, itemInterest };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create atendimento card' },
      { status: 400 }
    );
  }
}
