import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { CosmosService, CosmosGtinResponse, validateAndNormalizeGtin } from '@/lib/services/cosmos';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toNullableNumber(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function toWeightKg(payload: CosmosGtinResponse): number | null {
  const net = toNullableNumber(payload.net_weight);
  const gross = toNullableNumber(payload.gross_weight);
  const candidate = net ?? gross;
  if (candidate === null) return null;
  if (candidate >= 50) return Number((candidate / 1000).toFixed(3));
  return Number(candidate.toFixed(3));
}

function toTrimmedText(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function ensureAttributesBySlug(
  items: Array<{ slug: string; name: string }>
): Promise<Array<{ id: string; slug: string }>> {
  const existing = await prisma.attribute.findMany({
    where: { slug: { in: items.map((item) => item.slug) } },
    select: { id: true, slug: true }
  });

  const existingSlugs = new Set(existing.map((item) => item.slug));
  const missing = items.filter((item) => !existingSlugs.has(item.slug));

  if (missing.length > 0) {
    await Promise.all(
      missing.map((item) =>
        prisma.attribute.create({
          data: {
            name: item.name,
            slug: item.slug,
            type: 'TEXT',
            marketplaceRequired: false,
            entitySource: 'NONE'
          }
        })
      )
    );
  }

  return prisma.attribute.findMany({
    where: { slug: { in: items.map((item) => item.slug) } },
    select: { id: true, slug: true }
  });
}

async function ensureCanonicalSubcategory(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true, slug: true, description: true, active: true }
  });

  if (!category) {
    throw new Error('Categoria não encontrada');
  }

  const categorySlug = category.slug || slugify(category.name);
  const canonical = await prisma.subcategory.findFirst({
    where: {
      categoryId: category.id,
      OR: [{ slug: categorySlug }, { name: category.name }]
    },
    select: { id: true }
  });

  if (canonical) return canonical.id;

  const created = await prisma.subcategory.create({
    data: {
      categoryId: category.id,
      name: category.name,
      slug: categorySlug,
      description: category.description,
      active: category.active
    },
    select: { id: true }
  });

  return created.id;
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const body = (await req.json()) as { barcode?: string; categoryId?: string };
    const rawBarcode = body.barcode?.trim() || '';
    const rawCategoryId = body.categoryId?.trim() || '';
    if (!rawBarcode) {
      return errorResponse(new Error('Código de barras é obrigatório'), 400);
    }

    const barcode = validateAndNormalizeGtin(rawBarcode);

    const existingProduct = await prisma.product.findFirst({
      where: { barcode, active: true },
      select: {
        id: true,
        commercialName: true,
      }
    });

    if (existingProduct) {
      return successResponse({
        exists: true,
        existingProduct,
      });
    }

    const cosmos = await CosmosService.getByGtin(barcode);
    const description = toTrimmedText(cosmos.description);
    if (!description) {
      return errorResponse(new Error('Resposta da Cosmos sem descrição de produto'), 422);
    }

    const brandName = toTrimmedText(cosmos.brand?.name);
    let manufacturerId = '';
    if (brandName) {
      const foundManufacturer = await prisma.manufacturer.findFirst({
        where: {
          OR: [
            { name: { equals: brandName, mode: 'insensitive' } },
            { slug: slugify(brandName) }
          ]
        }
      });

      if (foundManufacturer) {
        manufacturerId = foundManufacturer.id;
      } else {
        const createdManufacturer = await prisma.manufacturer.create({
          data: {
            name: brandName,
            slug: slugify(brandName),
            active: true
          }
        });
        manufacturerId = createdManufacturer.id;
      }
    }

    const selectedCategory = rawCategoryId
      ? await prisma.category.findFirst({
        where: { id: rawCategoryId, active: true },
        select: { id: true }
      })
      : null;

    if (rawCategoryId && !selectedCategory) {
      return errorResponse(new Error('Categoria selecionada não está ativa ou não foi encontrada'), 422);
    }

    const defaultCategory = selectedCategory || await prisma.category.findFirst({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true }
    });

    if (!defaultCategory) {
      return errorResponse(new Error('Nenhuma categoria ativa disponível para importação'), 422);
    }

    const canonicalSubcategoryId = await ensureCanonicalSubcategory(defaultCategory.id);

    if (!manufacturerId) {
      const genericManufacturerName = 'SEM FABRICANTE';
      const genericSlug = 'sem-fabricante';
      const genericManufacturer = await prisma.manufacturer.upsert({
        where: { slug: genericSlug },
        update: {},
        create: {
          name: genericManufacturerName,
          slug: genericSlug,
          active: true
        }
      });
      manufacturerId = genericManufacturer.id;
    }

    await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: {
        subcategories: {
          connect: { id: canonicalSubcategoryId }
        }
      }
    });

    const importedAt = new Date().toISOString();
    const attributesToFill = [
      { slug: 'gpc-codigo', name: 'GPC Código', value: cosmos.gpc?.code },
      { slug: 'gpc-descricao', name: 'GPC Descrição', value: cosmos.gpc?.description },
      { slug: 'ncm-descricao', name: 'NCM Descrição', value: cosmos.ncm?.description },
      { slug: 'ncm-descricao-completa', name: 'NCM Descrição Completa', value: cosmos.ncm?.full_description },
      { slug: 'marca-imagem', name: 'Marca Imagem', value: cosmos.brand?.picture },
      { slug: 'imagem-produto', name: 'Imagem Produto', value: cosmos.thumbnail },
      {
        slug: 'preco-medio-cosmos',
        name: 'Preço Médio Cosmos',
        value: cosmos.avg_price !== null && cosmos.avg_price !== undefined ? String(cosmos.avg_price) : undefined
      },
      {
        slug: 'preco-maximo-cosmos',
        name: 'Preço Máximo Cosmos',
        value: cosmos.max_price !== null && cosmos.max_price !== undefined ? String(cosmos.max_price) : undefined
      },
      {
        slug: 'preco-minimo-cosmos',
        name: 'Preço Mínimo Cosmos',
        value: cosmos.min_price !== null && cosmos.min_price !== undefined ? String(cosmos.min_price) : undefined
      },
      { slug: 'preco-texto-cosmos', name: 'Preço Texto Cosmos', value: cosmos.price },
      { slug: 'integracao-origem', name: 'Integração Origem', value: 'COSMOS' },
      { slug: 'integracao-sincronizado-em', name: 'Integração Sincronizado Em', value: importedAt },
      { slug: 'integracao-payload-cosmos', name: 'Integração Payload Cosmos', value: JSON.stringify(cosmos) }
    ];

    const existingAttributes = await ensureAttributesBySlug(
      attributesToFill.map((item) => ({ slug: item.slug, name: item.name }))
    );

    const attributes = attributesToFill
      .map((item) => {
        const found = existingAttributes.find((attribute) => attribute.slug === item.slug);
        const value = toTrimmedText(item.value);
        if (!found || !value) return null;
        return { attributeId: found.id, value };
      })
      .filter((item): item is { attributeId: string; value: string } => item !== null);

    return successResponse({
      exists: false,
      draft: {
        commercialName: description,
        barcode,
        ncm: toTrimmedText(cosmos.ncm?.code) || '',
        shortDescription: description,
        longDescription: description,
        weight: toWeightKg(cosmos) ?? 0,
        height: toNullableNumber(cosmos.height) ?? 0,
        width: toNullableNumber(cosmos.width) ?? 0,
        length: toNullableNumber(cosmos.length) ?? 0,
        categoryId: defaultCategory.id,
        manufacturerId,
        attributes
      },
      cosmos: {
        avgPrice: cosmos.avg_price ?? null,
        minPrice: cosmos.min_price ?? null,
        maxPrice: cosmos.max_price ?? null,
        thumbnail: toTrimmedText(cosmos.thumbnail),
        brand: brandName,
        priceText: toTrimmedText(cosmos.price)
      }
    });
  } catch (error) {
    return errorResponse(error, 500);
  }
}
