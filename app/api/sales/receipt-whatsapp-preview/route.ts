import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const schema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(10),
  customerDocument: z.string().optional(),
  paymentMethod: z.string().min(1),
  subtotal: z.number().min(0),
  discount: z.number().min(0),
  total: z.number().min(0),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    total: z.number().min(0),
  })).min(1),
});

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

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const parsed = schema.parse(body);
    const customerPhone = normalizePhone(parsed.customerPhone);
    if (!customerPhone) {
      return errorResponse(new Error('Telefone inválido para WhatsApp'), 422);
    }

    const itemsSummary = parsed.items
      .map((item) => `- ${item.name} x${item.quantity} = ${item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
      .join('\n');

    const message = [
      '🧾 Prévia do Recibo - Virtual Games',
      `Data: ${new Date().toLocaleString('pt-BR')}`,
      `Cliente: ${parsed.customerName}`,
      parsed.customerDocument ? `Documento: ${parsed.customerDocument}` : '',
      `Pagamento: ${paymentLabel(parsed.paymentMethod)}`,
      '',
      'Itens:',
      itemsSummary,
      '',
      `Subtotal: ${parsed.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      `Desconto: ${parsed.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      `Total: ${parsed.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      '',
      'Comprovante enviado antes da confirmação final da venda.',
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
      return errorResponse(new Error('Falha ao enviar prévia de recibo pelo WhatsApp'), 502);
    }

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
