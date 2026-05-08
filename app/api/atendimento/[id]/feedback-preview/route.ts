import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function summarizeNames(names: string[]): string {
  const cleaned = names.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return cleaned.join(', ');
  return `${cleaned.slice(0, 2).join(', ')} +${cleaned.length - 2}`;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const card = await prisma.customerFunnelCard.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const latestSale = await prisma.sale.findFirst({
      where: { customerId: card.customerId, status: 'COMPLETED' },
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

    const latestService = await prisma.serviceOrder.findFirst({
      where: { customerId: card.customerId },
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

    if (!latestSale && !latestService) {
      return NextResponse.json({ error: 'Nenhuma venda ou serviço encontrado' }, { status: 422 });
    }

    const saleTime = latestSale ? new Date(latestSale.date).getTime() : 0;
    const serviceTime = latestService ? new Date(latestService.updatedAt).getTime() : 0;
    const targetType: 'SALE' | 'SERVICE' = saleTime >= serviceTime ? 'SALE' : 'SERVICE';

    const eventDate = targetType === 'SALE'
      ? new Date(latestSale!.date)
      : new Date(latestService!.updatedAt);

    const defaultMessage = `Olá! Aqui é da Virtual Games.\nVocê pode avaliar o atendimento realizado em ${formatDate(eventDate)}?\nResponda com nota de 1 a 5 (1=totalmente insatisfeito, 5=totalmente satisfeito).`;

    return NextResponse.json({
      customerName: card.customer.name,
      customerPhone: normalizePhone(card.customer.phone ?? ''),
      targetType,
      eventName: 'o atendimento',
      eventDate: formatDate(eventDate),
      defaultMessage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load feedback preview' },
      { status: 500 }
    );
  }
}
