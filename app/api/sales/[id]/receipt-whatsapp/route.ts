import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function paymentLabel(method: string) {
  if (method === 'pix') return 'PIX';
  if (method === 'credito') return 'Cartão de Crédito';
  if (method === 'debito') return 'Cartão de Débito';
  if (method === 'dinheiro') return 'Dinheiro';
  return method;
}

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { id } = await context.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                commercialName: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      return errorResponse(new Error('Venda não encontrada'), 404);
    }

    const customerName = sale.customer?.name || '';
    const customerPhone = normalizePhone(sale.customer?.phone || '');
    if (!customerName) {
      return errorResponse(new Error('Venda sem nome de cliente vinculado'), 422);
    }
    if (!customerPhone) {
      return errorResponse(new Error('Cliente sem telefone cadastrado'), 422);
    }

    const itemsSummary = sale.items
      .map((item) => `- ${item.product.commercialName} x${item.quantity} = ${Number(item.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
      .join('\n');

    const subtotal = sale.items.reduce((acc, item) => acc + Number(item.total), 0);

    const message = [
      '🧾 Recibo de Venda - Virtual Games',
      `Venda: #${sale.id.slice(-8).toUpperCase()}`,
      `Data: ${new Date(sale.date).toLocaleString('pt-BR')}`,
      `Cliente: ${customerName}`,
      sale.customer?.document ? `Documento: ${sale.customer.document}` : '',
      `Pagamento: ${paymentLabel(sale.paymentMethod)}`,
      '',
      'Itens:',
      itemsSummary,
      '',
      `Subtotal: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      `Desconto: ${Number(sale.discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      `Total: ${Number(sale.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      '',
      'Obrigado pela preferência!',
    ].filter(Boolean).join('\n');

    const botUrl = process.env.WHATSAPP_BOT_URL || 'http://127.0.0.1:3333/send';
    const botToken = process.env.WHATSAPP_BOT_TOKEN || '';

    const botResponse = await fetch(botUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bot-token': botToken,
      },
      body: JSON.stringify({
        phone: customerPhone,
        message,
      }),
    });

    if (!botResponse.ok) {
      return errorResponse(new Error('Falha ao enviar recibo pelo WhatsApp'), 502);
    }

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
