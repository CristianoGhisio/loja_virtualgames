import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const [sales, serviceOrders] = await Promise.all([
      prisma.sale.findMany({
        where: {
          customerId: id,
          status: 'COMPLETED',
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  commercialName: true,
                  warrantyMonths: true
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.serviceOrder.findMany({
        where: {
          customerId: id,
          status: 'ENTREGUE',
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  commercialName: true,
                  warrantyMonths: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  warrantyMonths: true,
                },
              },
            },
          },
        },
        orderBy: {
          endDate: 'desc',
        },
      })
    ]);

    const now = new Date();
    const saleWarranties = sales.flatMap((sale) => {
      return sale.items.flatMap((item) => {
        const warrantyMonths = Math.max(0, Number(item.warrantyMonths ?? item.product.warrantyMonths ?? 0));
        if (warrantyMonths <= 0) {
          return [];
        }

        const expiryDate = new Date(sale.date);
        expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

        return [{
          id: `${sale.id}-${item.id}`,
          sourceType: 'SALE_PRODUCT',
          sourceId: sale.id,
          sourceCode: `VENDA #${sale.id.slice(-6).toUpperCase()}`,
          itemCategory: 'Produto',
          warrantyMonths,
          purchaseDate: sale.date.toISOString(),
          item: {
            id: item.product.id,
            name: item.product.commercialName,
          },
          expiry: expiryDate.toISOString(),
          status: expiryDate >= now ? 'Ativa' : 'Expirada',
        }];
      });
    });

    const serviceWarranties = serviceOrders.flatMap((serviceOrder) => {
      const baseDate = serviceOrder.endDate ?? serviceOrder.updatedAt ?? serviceOrder.createdAt;
      return serviceOrder.items.flatMap((item) => {
        const warrantyMonths = Math.max(
          0,
          Number(item.warrantyMonths ?? (item.type === 'SERVICE'
            ? item.service?.warrantyMonths
            : item.product?.warrantyMonths) ?? 0)
        );
        if (warrantyMonths <= 0) {
          return [];
        }

        const expiryDate = new Date(baseDate);
        expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

        return [{
          id: `${serviceOrder.id}-${item.id}`,
          sourceType: item.type === 'SERVICE' ? 'OS_SERVICE' : 'OS_PART',
          sourceId: serviceOrder.id,
          sourceCode: `OS #${serviceOrder.id.slice(-6).toUpperCase()}`,
          itemCategory: item.type === 'SERVICE' ? 'Serviço' : 'Peça',
          warrantyMonths,
          purchaseDate: baseDate.toISOString(),
          item: {
            id: item.type === 'SERVICE' ? item.service?.id : item.product?.id,
            name: item.type === 'SERVICE'
              ? item.service?.name ?? item.name
              : item.product?.commercialName ?? item.name,
          },
          expiry: expiryDate.toISOString(),
          status: expiryDate >= now ? 'Ativa' : 'Expirada',
        }];
      });
    });

    const warranties = [...saleWarranties, ...serviceWarranties]
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    return NextResponse.json(warranties);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch warranties' }, { status: 500 });
  }
}
