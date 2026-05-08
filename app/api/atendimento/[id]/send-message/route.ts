import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';


export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await context.params;
    const body = await request.json();
    const message = String(body.message ?? '').trim();

    if (!message) {
      return errorResponse(new Error('Mensagem não pode estar vazia'), 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const card = await tx.customerFunnelCard.findUnique({
        where: { id },
        select: { customerId: true },
      });

      if (!card) {
        throw new Error('Card não encontrado');
      }

      const customer = await tx.customer.findUnique({
        where: { id: card.customerId },
        select: { phone: true },
      });

      if (!customer?.phone) {
        throw new Error('Cliente não possui telefone cadastrado');
      }

      const phone = customer.phone.replace(/\D/g, '');

      if (!phone) {
        throw new Error('Telefone do cliente inválido');
      }

      const botUrl = process.env.WHATSAPP_BOT_URL || 'http://127.0.0.1:3333/send';
      const botToken = process.env.WHATSAPP_BOT_TOKEN || '';

      let botResponse: Response;
      try {
        botResponse = await fetch(botUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bot-token': botToken,
          },
          body: JSON.stringify({ phone, message }),
          signal: AbortSignal.timeout(10000),
        });
      } catch {
        throw new Error('WhatsApp bot indisponível no momento');
      }

      if (!botResponse.ok) {
        throw new Error('WhatsApp bot indisponível no momento');
      }

      const interaction = await tx.customerInteraction.create({
        data: {
          customerId: card.customerId,
          type: 'RESPOSTA_ATENDENTE',
          content: message,
        },
      });

      return interaction;
    });

    return successResponse({ interaction: result });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Card não encontrado') {
        return errorResponse(error, 404);
      }
      if (error.message.includes('telefone') || error.message === 'Mensagem não pode estar vazia') {
        return errorResponse(error, 400);
      }
      if (error.message === 'WhatsApp bot indisponível no momento') {
        return errorResponse(error, 502);
      }
    }
    return errorResponse(error);
  }
}
