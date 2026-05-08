import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

type WarrantyEntry = {
  id: string;
  sourceType: 'SALE_PRODUCT' | 'OS_SERVICE' | 'OS_PART';
  sourceId: string;
  sourceCode: string;
  customerId: string | null;
  customerName: string;
  itemId: string | null;
  itemName: string;
  itemCategory: 'Produto' | 'Serviço' | 'Peça';
  warrantyMonths: number;
  purchaseDate: string;
  expiry: string;
  status: 'Ativa' | 'Expirada';
};

export async function GET() {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const [sales, serviceOrders] = await Promise.all([
      prisma.sale.findMany({
        where: {
          status: 'COMPLETED',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
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
          status: 'ENTREGUE',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
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
    const result: WarrantyEntry[] = [];

    for (const sale of sales) {
      for (const item of sale.items) {
        const months = Math.max(0, Number(item.warrantyMonths ?? item.product.warrantyMonths ?? 0));
        if (months <= 0) continue;

        const expiryDate = new Date(sale.date);
        expiryDate.setMonth(expiryDate.getMonth() + months);

        result.push({
          id: `${sale.id}-${item.id}`,
          sourceType: 'SALE_PRODUCT',
          sourceId: sale.id,
          sourceCode: `VENDA #${sale.id.slice(-6).toUpperCase()}`,
          customerId: sale.customer?.id ?? null,
          customerName: sale.customer?.name ?? 'Consumidor final',
          itemId: item.product.id,
          itemName: item.product.commercialName,
          itemCategory: 'Produto',
          warrantyMonths: months,
          purchaseDate: sale.date.toISOString(),
          expiry: expiryDate.toISOString(),
          status: expiryDate >= now ? 'Ativa' : 'Expirada',
        });
      }
    }

    for (const serviceOrder of serviceOrders) {
      const baseDate = serviceOrder.endDate ?? serviceOrder.updatedAt ?? serviceOrder.createdAt;
      for (const item of serviceOrder.items) {
        const months = Math.max(
          0,
          Number(item.warrantyMonths ?? (item.type === 'SERVICE'
            ? item.service?.warrantyMonths
            : item.product?.warrantyMonths) ?? 0)
        );
        if (months <= 0) continue;
        const expiryDate = new Date(baseDate);
        expiryDate.setMonth(expiryDate.getMonth() + months);

        result.push({
          id: `${serviceOrder.id}-${item.id}`,
          sourceType: item.type === 'SERVICE' ? 'OS_SERVICE' : 'OS_PART',
          sourceId: serviceOrder.id,
          sourceCode: `OS #${serviceOrder.id.slice(-6).toUpperCase()}`,
          customerId: serviceOrder.customer?.id ?? null,
          customerName: serviceOrder.customer?.name ?? 'Consumidor final',
          itemId: item.type === 'SERVICE' ? item.service?.id ?? null : item.product?.id ?? null,
          itemName: item.type === 'SERVICE'
            ? item.service?.name ?? item.name
            : item.product?.commercialName ?? item.name,
          itemCategory: item.type === 'SERVICE' ? 'Serviço' : 'Peça',
          warrantyMonths: months,
          purchaseDate: baseDate.toISOString(),
          expiry: expiryDate.toISOString(),
          status: expiryDate >= now ? 'Ativa' : 'Expirada',
        });
      }
    }

    result.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
