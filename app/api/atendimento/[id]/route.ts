import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

const STAGES = ['NOVO_CONTATO', 'EM_ANDAMENTO', 'CONTATO_QUENTE', 'VENDA_CONCLUIDA', 'FEEDBACK_REALIZADO', 'FINALIZADO'] as const;
type FunnelStage = (typeof STAGES)[number];

const STAGE_LABEL: Record<FunnelStage, string> = {
  NOVO_CONTATO: 'Novo Contato',
  EM_ANDAMENTO: 'Em Andamento',
  CONTATO_QUENTE: 'Contato quente (interessado)',
  VENDA_CONCLUIDA: 'Venda ou Serviço Finalizado',
  FEEDBACK_REALIZADO: 'Solicitar Feedbackk',
  FINALIZADO: 'Finalizado',
};

type FeedbackDispatch = {
  requestId: string;
  customerId: string;
  phone: string;
  message: string;
  referenceLabel: string;
  targetType: 'SALE' | 'SERVICE';
  referenceId: string;
};

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const observation = body.observation !== undefined ? String(body.observation).trim() : '';

    const requestedStage = STAGES.includes(body.stage) ? (body.stage as FunnelStage) : undefined;
    const requestedNote = body.sellerNote !== undefined ? String(body.sellerNote).trim() : undefined;
    const requestedItemInterest = body.itemInterest !== undefined ? String(body.itemInterest).trim() : undefined;
    const requestFeedback = body.requestFeedback === true;
    const requestedFeedbackMessage = body.feedbackMessage !== undefined ? String(body.feedbackMessage).trim() : '';

    const result = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{
        id: string;
        customerId: string;
        stage: FunnelStage;
        sellerNote: string | null;
        itemInterest: string | null;
        active: boolean;
      }>>(Prisma.sql`
        SELECT
          cfc."id",
          cfc."customerId",
          cfc."stage"::text as "stage",
          cfc."sellerNote",
          cfc."itemInterest",
          cfc."active"
        FROM "CustomerFunnelCard" cfc
        WHERE cfc."id" = ${id}
        LIMIT 1
      `);

      const current = rows[0];

      if (!current) {
        throw new Error('Card not found');
      }

      const nextStage = requestedStage ?? current.stage;
      const nextNote = requestedNote !== undefined ? requestedNote : current.sellerNote;
      const nextItemInterest = requestedItemInterest !== undefined ? requestedItemInterest : current.itemInterest;
      const stageChanged = nextStage !== current.stage;
      const noteChanged = requestedNote !== undefined && requestedNote !== (current.sellerNote ?? '');
      const itemInterestChanged = requestedItemInterest !== undefined && requestedItemInterest !== (current.itemInterest ?? '');
      const isFirstContactTransition = current.stage === 'NOVO_CONTATO' && nextStage === 'EM_ANDAMENTO';
      const isContactQuenteTransition = current.stage === 'EM_ANDAMENTO' && nextStage === 'CONTATO_QUENTE';
      const isContactQuenteEdit = current.stage === 'CONTATO_QUENTE' && nextStage === 'CONTATO_QUENTE';
      const isFeedbackTransition = current.stage === 'VENDA_CONCLUIDA' && nextStage === 'FEEDBACK_REALIZADO';

      const requiresObservation =
        !isFirstContactTransition &&
        !isContactQuenteTransition &&
        !isContactQuenteEdit &&
        !isFeedbackTransition;

      if (!stageChanged && !noteChanged && !itemInterestChanged) {
        throw new Error('Nenhuma alteração detectada. Atualize pelo menos um campo antes de salvar.');
      }

      if (requiresObservation && !observation) {
        throw new Error('Justificativa é obrigatória para qualquer mudança de etapa');
      }

      const lastStageChangeExpression = stageChanged
        ? Prisma.sql`NOW()`
        : Prisma.sql`"lastStageChangeAt"`;

      await tx.$executeRaw(Prisma.sql`
        UPDATE "CustomerFunnelCard"
        SET
          "stage" = ${nextStage}::"FunnelStage",
          "sellerNote" = ${nextNote},
          "itemInterest" = ${nextItemInterest},
          "active" = true,
          "archivedAt" = NULL,
          "updatedAt" = NOW(),
          "lastStageChangeAt" = ${lastStageChangeExpression}
        WHERE "id" = ${id}
      `);

      const contentParts: string[] = [];
      if (stageChanged) {
        // eslint-disable-next-line security/detect-object-injection
        contentParts.push(`Status alterado de ${STAGE_LABEL[current.stage]} para ${STAGE_LABEL[nextStage]}`);
      }
      if (noteChanged && nextNote) {
        contentParts.push(`Observação atualizada: ${nextNote}`);
      }
      contentParts.push(`[Justificativa]: ${observation}`);

      await tx.customerInteraction.create({
        data: {
          customerId: current.customerId,
          type: 'CRM',
          content: contentParts.join(' - '),
        },
      });

      let feedbackDispatch: FeedbackDispatch | null = null;

      if (stageChanged && current.stage === 'VENDA_CONCLUIDA' && nextStage === 'FEEDBACK_REALIZADO' && requestFeedback) {
        const customer = await tx.customer.findUnique({
          where: { id: current.customerId },
          select: { id: true, phone: true },
        });

        const customerPhone = normalizePhone(customer?.phone ?? '');
        if (!customerPhone) {
          throw new Error('Cliente sem telefone cadastrado para solicitar feedback');
        }

        const latestSale = await tx.sale.findFirst({
          where: { customerId: current.customerId, status: 'COMPLETED' },
          orderBy: { date: 'desc' },
          select: {
            id: true,
            date: true,
            items: {
              select: {
                product: {
                  select: {
                    commercialName: true,
                  },
                },
              },
            },
          },
        });

        const latestService = await tx.serviceOrder.findFirst({
          where: { customerId: current.customerId },
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            updatedAt: true,
            device: true,
            items: {
              where: { type: 'SERVICE' },
              select: { name: true },
            },
          },
        });

        const saleDate = latestSale?.date ? new Date(latestSale.date).getTime() : 0;
        const serviceDate = latestService?.updatedAt ? new Date(latestService.updatedAt).getTime() : 0;

        if (!latestSale && !latestService) {
          throw new Error('Nenhuma venda ou serviço encontrado para solicitar feedback');
        }

        const targetType: 'SALE' | 'SERVICE' = saleDate >= serviceDate ? 'SALE' : 'SERVICE';
        const referenceId = targetType === 'SALE'
          ? String(latestSale?.id)
          : String(latestService?.id);

        const eventDate = targetType === 'SALE'
          ? new Date(latestSale!.date)
          : new Date(latestService!.updatedAt);

        const eventLabel = `o atendimento realizado em ${formatDate(eventDate)}`;

        const referenceLabel = eventLabel;

        const requestId = crypto.randomUUID();
        const feedbackMessage = requestedFeedbackMessage || `Olá! Aqui é da Virtual Games.\nVocê pode avaliar ${referenceLabel}?\nResponda com nota de 1 a 5 (1=totalmente insatisfeito, 5=totalmente satisfeito).`;

        await tx.$executeRaw(Prisma.sql`
          UPDATE "CustomerFeedbackRequest"
          SET "status" = 'CANCELLED', "updatedAt" = NOW()
          WHERE "customerId" = ${current.customerId} AND "status" = 'PENDING'
        `);

        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "CustomerFeedbackRequest"
            ("id", "customerId", "targetType", "saleId", "serviceOrderId", "funnelCardId", "status", "message", "createdAt", "updatedAt")
          VALUES
            (
              ${requestId},
              ${current.customerId},
              ${targetType},
              ${targetType === 'SALE' ? referenceId : null},
              ${targetType === 'SERVICE' ? referenceId : null},
              ${current.id},
              'PENDING',
              ${feedbackMessage},
              NOW(),
              NOW()
            )
        `);

        feedbackDispatch = {
          requestId,
          customerId: current.customerId,
          phone: customerPhone,
          message: feedbackMessage,
          referenceLabel,
          targetType,
          referenceId,
        };
      }

      return {
        id: current.id,
        customerId: current.customerId,
        stage: nextStage,
        sellerNote: nextNote,
        itemInterest: nextItemInterest,
        active: true,
        feedbackDispatch,
      };
    });

    if (result.feedbackDispatch) {
      const botUrl = process.env.WHATSAPP_BOT_URL || 'http://127.0.0.1:3333/send';
      const botToken = process.env.WHATSAPP_BOT_TOKEN || '';

      const response = await fetch(botUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bot-token': botToken,
        },
        body: JSON.stringify({
          phone: result.feedbackDispatch.phone,
          message: result.feedbackDispatch.message,
        }),
      });

      if (!response.ok) {
        await prisma.customerInteraction.create({
          data: {
            customerId: result.customerId,
            type: 'PESQUISA_SATISFACAO',
            content: `Falha ao enviar solicitação de feedback da ${result.feedbackDispatch.referenceLabel}.`,
          },
        });
        return NextResponse.json(
          { error: 'Solicitação de feedback não enviada. Verifique se o bot está ativo.' },
          { status: 502 }
        );
      }

      await prisma.customerInteraction.create({
        data: {
          customerId: result.customerId,
          type: 'PESQUISA_SATISFACAO',
          content: `Solicitação de feedback enviada para ${result.feedbackDispatch.referenceLabel}.`,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update card' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{
        id: string;
        customerId: string;
        stage: FunnelStage;
      }>>(Prisma.sql`
        SELECT cfc."id", cfc."customerId", cfc."stage"::text as "stage"
        FROM "CustomerFunnelCard" cfc
        WHERE cfc."id" = ${id}
        LIMIT 1
      `);

      const card = rows[0];
      if (!card) {
        throw new Error('Card not found');
      }

      await tx.$executeRaw(Prisma.sql`
        DELETE FROM "CustomerFunnelCard"
        WHERE "id" = ${id}
      `);

      await tx.customerInteraction.create({
        data: {
          customerId: card.customerId,
          type: 'CRM',
          content: `Card removido da etapa ${STAGE_LABEL[card.stage]}`,
        },
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete card' },
      { status: 400 }
    );
  }
}
