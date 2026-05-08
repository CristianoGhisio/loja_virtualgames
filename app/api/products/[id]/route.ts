import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await request.json();

    const conditionValue = json.condition === 'Novo'
      ? 'NEW'
      : json.condition === 'Usado'
        ? 'USED'
        : json.condition;

    const normalizedBarcode = typeof json.barcode === 'string' && json.barcode.trim() !== ''
      ? json.barcode.trim()
      : null;
    if (!normalizedBarcode) {
      return NextResponse.json({ error: 'Código de barras é obrigatório' }, { status: 400 });
    }
    const normalizedBaseSku = typeof json.baseSku === 'string' && json.baseSku.trim() !== ''
      ? json.baseSku.trim()
      : null;
    const normalizedNcm = typeof json.ncm === 'string' && json.ncm.trim() !== ''
      ? json.ncm.trim()
      : null;
    const normalizedUnit = typeof json.unit === 'string' && json.unit.trim() !== ''
      ? json.unit.trim()
      : 'UN';
    const warrantyMonthsValue = Number(json.warrantyMonths);
    const normalizedWarrantyMonths = Number.isFinite(warrantyMonthsValue)
      ? Math.max(0, Math.trunc(warrantyMonthsValue))
      : null;

    const updateData: Prisma.ProductUpdateInput = {
      commercialName: json.commercialName,
      baseSku: normalizedBaseSku,
      price: Number(json.price) || 0,
      // costPrice and stock are in Stock model

      condition: conditionValue,
      barcode: normalizedBarcode,
      ncm: normalizedNcm,
      warrantyMonths: normalizedWarrantyMonths,
      unit: normalizedUnit,
      controlSerialNumber: json.controlSerialNumber,
      allowUsed: json.allowUsed
    };

    if (typeof json.active === 'boolean') {
      updateData.active = json.active;
    }

    if (json.categoryId) {
      updateData.category = { connect: { id: json.categoryId } };
    }
    if (json.manufacturerId) {
      updateData.manufacturer = { connect: { id: json.manufacturerId } };
    }

    if (conditionValue === 'NEW') {
      updateData.supplier = typeof json.supplierId === 'string' && json.supplierId.trim() !== ''
        ? { connect: { id: json.supplierId.trim() } }
        : { disconnect: true };
      updateData.originClient = { disconnect: true };
    } else if (conditionValue === 'USED') {
      updateData.originClient = typeof json.originClientId === 'string' && json.originClientId.trim() !== ''
        ? { connect: { id: json.originClientId.trim() } }
        : { disconnect: true };
      updateData.supplier = { disconnect: true };
    }

    // Handle attributes
    if (json.attributes && Array.isArray(json.attributes)) {
        // We'll use a transaction for this update
        const product = await prisma.$transaction(async (tx) => {
            const p = await tx.product.update({
                where: { id },
                data: updateData
            });

            // Replace attributes
            await tx.productAttribute.deleteMany({
                where: { productId: id }
            });

            if (json.attributes.length > 0) {
                await tx.productAttribute.createMany({
                    data: json.attributes.map((a: { attributeId: string; value: string }) => ({
                        productId: id,
                        attributeId: a.attributeId,
                        value: a.value
                    }))
                });
            }

            return p;
        });

        // Update Stock settings (minStock and averageCost)
        if (json.minStock !== undefined || json.costPrice !== undefined) {
            const stockUpdateData: { minStock?: number; averageCost?: number } = {};
            if (json.minStock !== undefined) stockUpdateData.minStock = Number(json.minStock) || 5;
            if (json.costPrice !== undefined) stockUpdateData.averageCost = Number(json.costPrice) || 0;

            await prisma.stock.upsert({
                where: { productId: id },
                create: { 
                    productId: id, 
                    quantity: 0, 
                    minStock: stockUpdateData.minStock || 5,
                    averageCost: stockUpdateData.averageCost || 0
                },
                update: stockUpdateData
            });
        }
        
        return NextResponse.json(product);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    // Update Stock settings (minStock and averageCost)
    if (json.minStock !== undefined || json.costPrice !== undefined) {
        const stockUpdateData: { minStock?: number; averageCost?: number } = {};
        if (json.minStock !== undefined) stockUpdateData.minStock = Number(json.minStock) || 5;
        if (json.costPrice !== undefined) stockUpdateData.averageCost = Number(json.costPrice) || 0;

      await prisma.stock.upsert({
        where: { productId: id },
        create: { 
            productId: id, 
            quantity: 0, 
            minStock: stockUpdateData.minStock || 5,
            averageCost: stockUpdateData.averageCost || 0
        },
        update: stockUpdateData
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um produto com esse código de barras.' }, { status: 409 });
    }
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    void request;
    const { id } = await params;
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.marketplaceListing.deleteMany({
        where: { productId: id }
      });

      await tx.saleItem.deleteMany({
        where: { productId: id }
      });

      await tx.serviceOrderItem.deleteMany({
        where: { productId: id }
      });

      await tx.stockMovement.deleteMany({
        where: { productId: id }
      });

      await tx.productPriceHistory.deleteMany({
        where: { productId: id }
      });

      await tx.productAttribute.deleteMany({
        where: { productId: id }
      });

      await tx.item.deleteMany({
        where: { productId: id }
      });

      await tx.stock.deleteMany({
        where: { productId: id }
      });

      await tx.productVariation.deleteMany({
        where: { productId: id }
      });

      await tx.product.delete({
        where: { id }
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Não foi possível excluir o produto definitivamente' }, { status: 500 });
  }
}
