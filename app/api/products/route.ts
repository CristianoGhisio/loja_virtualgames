import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

const productSchema = z.object({
  commercialName: z.string().min(3),
  categoryId: z.string(),
  manufacturerId: z.string(),
  baseSku: z.string().optional(),

  price: z.number().min(0),
  costPrice: z.number().min(0),
  margin: z.number().optional().default(0),
  commission: z.number().optional().default(0),
  stock: z.number().int().min(0), // Initial stock requested
  minStock: z.number().int().min(0).default(5),

  barcode: z.string().trim().min(1, 'Código de barras é obrigatório'),
  ncm: z.string().optional(),
  warrantyMonths: z.number().int().min(0).optional(),
  unit: z.string().default('UN'),

  // Descriptions
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),

  // Dimensions
  weight: z.number().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  length: z.number().optional(),

  controlSerialNumber: z.boolean().default(false),
  allowUsed: z.boolean().default(true),

  initialStock: z.boolean().optional(),
  condition: z.enum(['Novo', 'Usado']).optional(),
  supplierId: z.string().optional(),
  originClientId: z.string().optional(),

  variations: z.array(z.object({
    sku: z.string(),
    title: z.string(),
    basePrice: z.number(),
    active: z.boolean(),
  })).optional().default([]),

  attributes: z.array(z.object({
    attributeId: z.string(),
    value: z.string(),
  })).optional().default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const query = searchParams.get('q') || searchParams.get('search');
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query) {
      where.OR = [
        { id: { contains: query, mode: 'insensitive' } },
        { commercialName: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
        { manufacturer: { name: { contains: query, mode: 'insensitive' } } }
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          manufacturer: true,
          stock: true,
          supplier: true,
          originClient: true,
          attributes: {
            include: { attribute: true }
          }
        },
        orderBy: { commercialName: 'asc' },
      }),
    ]);

    // Flatten/Format for frontend if necessary, or frontend adapts.
    // Frontend expects flat structure mostly.
    const formattedProducts = products.map(p => ({
      ...p,
      stock: p.stock?.quantity || 0,
      minStock: p.stock?.minStock || 0,
      costPrice: Number(p.stock?.averageCost || 0),
      stockTotalValue: Number(p.stock?.totalValue || 0),
      stockAverageCost: Number(p.stock?.averageCost || 0),
      totalSaleValue: Number(p.price) * (p.stock?.quantity || 0),
      category: p.category,
      brand: p.manufacturer,
      name: p.commercialName,
    }));

    return successResponse({
      data: formattedProducts,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, session, response } = await checkAuth();
    if (!authorized) return response;

    const body = await req.json();
    const parsed = productSchema.parse(body);

    const normalizedBarcode = parsed.barcode.trim();
    // If baseSku is empty string, convert to null to avoid unique constraint violation
    const normalizedBaseSku = parsed.baseSku?.trim() ? parsed.baseSku.trim() : null;
    const normalizedNcm = parsed.ncm?.trim() || null;
    const normalizedUnit = parsed.unit?.trim() || 'UN';
    const normalizedSupplierId = parsed.supplierId?.trim() || null;
    const normalizedOriginClientId = parsed.originClientId?.trim() || null;

    // Use transaction to ensure product creation and initial stock movement are atomic
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Product
      const product = await tx.product.create({
        data: {
          commercialName: parsed.commercialName,
          baseSku: normalizedBaseSku,
          categoryId: parsed.categoryId,
          manufacturerId: parsed.manufacturerId,

          price: parsed.price,
          // costPrice is in Stock table

          barcode: normalizedBarcode,
          ncm: normalizedNcm,
          warrantyMonths: parsed.warrantyMonths ?? 0,
          unit: normalizedUnit,
          shortDescription: parsed.shortDescription,
          longDescription: parsed.longDescription,
          weight: parsed.weight,
          height: parsed.height,
          width: parsed.width,
          length: parsed.length,
          margin: parsed.margin,
          commission: parsed.commission,
          controlSerialNumber: parsed.controlSerialNumber,
          allowUsed: parsed.allowUsed,

          condition: parsed.condition === 'Novo' ? 'NEW' : 'USED',
          supplierId: parsed.condition === 'Novo' ? normalizedSupplierId : undefined,
          originClientId: parsed.condition === 'Usado' ? normalizedOriginClientId : undefined,
          variations: {
            create: parsed.variations.map(v => ({
              sku: v.sku,
              title: v.title,
              basePrice: v.basePrice,
              active: v.active
            }))
          },
          attributes: {
            create: parsed.attributes.map(a => ({
              attributeId: a.attributeId,
              value: a.value
            }))
          }
        },
      });

      // 2. Create Stock Record
      const stock = await tx.stock.create({
        data: {
          productId: product.id,
          quantity: 0,
          minStock: parsed.minStock,
          averageCost: parsed.costPrice, // Set initial average cost
        }
      });

      // 3. Handle Initial Stock Movement
      if (parsed.initialStock && parsed.stock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: 'IN_ADJUSTMENT',
            quantity: parsed.stock,
            unitCost: parsed.costPrice,
            reason: 'Estoque Inicial',
            createdBy: session?.user?.id,
          },
        });

        // Update stock quantity
        await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: parsed.stock },
        });

        stock.quantity = parsed.stock;
      }

      return { ...product, stock };
    });

    return successResponse(result, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const meta = error.meta as { target?: string | string[] } | undefined;
      const target = meta?.target;

      const isBarcodeUnique = Array.isArray(target)
        ? target.includes('barcode')
        : typeof target === 'string'
          ? target.includes('barcode')
          : false;

      if (isBarcodeUnique) {
        return errorResponse(new Error('Já existe um produto com esse código de barras.'), 409);
      }
    }
    return errorResponse(error);
  }
}
