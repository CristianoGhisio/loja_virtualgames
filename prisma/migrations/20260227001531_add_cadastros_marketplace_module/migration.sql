/*
  Warnings:

  - You are about to drop the column `parentId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `brandId` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyDuration` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `brandId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyDuration` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `Brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BrandToCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[manufacturerId,subcategoryId,name]` on the table `Model` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[baseSku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[internalCode]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manufacturerId` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategoryId` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commercialName` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `modelId` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `categoryId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `internalCode` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceBase` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'LIST', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'SOLD', 'MAINTENANCE', 'RESERVED');

-- CreateEnum
CREATE TYPE "ServicePriceType" AS ENUM ('FIXED', 'HOURLY', 'VARIABLE');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('PERCENT', 'FIXED');

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_modelId_fkey";

-- DropForeignKey
ALTER TABLE "_BrandToCategory" DROP CONSTRAINT "_BrandToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_BrandToCategory" DROP CONSTRAINT "_BrandToCategory_B_fkey";

-- DropIndex
DROP INDEX "Category_parentId_idx";

-- DropIndex
DROP INDEX "Category_parentId_name_key";

-- DropIndex
DROP INDEX "Model_brandId_name_key";

-- DropIndex
DROP INDEX "Product_barcode_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "parentId",
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "brandId",
DROP COLUMN "warrantyDuration",
ADD COLUMN     "manufacturerId" TEXT NOT NULL,
ADD COLUMN     "referenceCode" TEXT,
ADD COLUMN     "releaseYear" INTEGER,
ADD COLUMN     "subcategoryId" TEXT NOT NULL,
ADD COLUMN     "warrantyMonths" INTEGER;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brandId",
DROP COLUMN "categoryId",
DROP COLUMN "costPrice",
DROP COLUMN "description",
DROP COLUMN "minStock",
DROP COLUMN "name",
DROP COLUMN "stock",
DROP COLUMN "warrantyDuration",
ADD COLUMN     "allowUsed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "baseSku" TEXT,
ADD COLUMN     "commercialName" TEXT NOT NULL,
ADD COLUMN     "commission" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "controlSerialNumber" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "height" DECIMAL(10,2),
ADD COLUMN     "length" DECIMAL(10,2),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "longDescription" TEXT,
ADD COLUMN     "margin" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "warrantyMonths" INTEGER,
ADD COLUMN     "weight" DECIMAL(10,3),
ADD COLUMN     "width" DECIMAL(10,2),
ALTER COLUMN "modelId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "description",
DROP COLUMN "price",
ADD COLUMN     "allowDiscount" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowMarketplace" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "commissionType" "CommissionType" NOT NULL DEFAULT 'PERCENT',
ADD COLUMN     "commissionValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "costBase" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "descriptionLong" TEXT,
ADD COLUMN     "descriptionShort" TEXT,
ADD COLUMN     "estimatedTimeMin" INTEGER,
ADD COLUMN     "internalCode" TEXT NOT NULL,
ADD COLUMN     "marketplaceCategoryId" TEXT,
ADD COLUMN     "marketplaceDescTemplate" TEXT,
ADD COLUMN     "marketplaceTitleTemplate" TEXT,
ADD COLUMN     "priceBase" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "priceType" "ServicePriceType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "requiresDevice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiresParts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiresSerial" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "invoice" TEXT,
ADD COLUMN     "resultingAverageCost" DECIMAL(10,2),
ADD COLUMN     "supplierId" TEXT,
ADD COLUMN     "unitCost" DECIMAL(10,2);

-- DropTable
DROP TABLE "Brand";

-- DropTable
DROP TABLE "_BrandToCategory";

-- CreateTable
CREATE TABLE "SupplierInteraction" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL DEFAULT 'TEXT',
    "marketplaceRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttribute" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "averageCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "imei" TEXT,
    "condition" "ProductCondition" NOT NULL,
    "grade" TEXT,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "warrantyDays" INTEGER,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marketplace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marketplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceCategory" (
    "id" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "externalCode" TEXT NOT NULL,
    "externalName" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "MarketplaceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variationId" TEXT,
    "externalId" TEXT,
    "publishedTitle" TEXT,
    "publishedPrice" DECIMAL(10,2),
    "status" TEXT DEFAULT 'DRAFT',
    "publicLink" TEXT,
    "syncStock" BOOLEAN NOT NULL DEFAULT true,
    "syncPrice" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_slug_key" ON "Subcategory"("slug");

-- CreateIndex
CREATE INDEX "Subcategory_categoryId_idx" ON "Subcategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_slug_key" ON "Manufacturer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariation_sku_key" ON "ProductVariation"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_slug_key" ON "Attribute"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttribute_productId_attributeId_key" ON "ProductAttribute"("productId", "attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_key" ON "Stock"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_serialNumber_key" ON "Item"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Marketplace_name_key" ON "Marketplace"("name");

-- CreateIndex
CREATE INDEX "MarketplaceCategory_categoryId_idx" ON "MarketplaceCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceCategory_marketplaceId_externalCode_key" ON "MarketplaceCategory"("marketplaceId", "externalCode");

-- CreateIndex
CREATE INDEX "MarketplaceListing_externalId_idx" ON "MarketplaceListing"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceListing_marketplaceId_productId_variationId_key" ON "MarketplaceListing"("marketplaceId", "productId", "variationId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Model_manufacturerId_idx" ON "Model"("manufacturerId");

-- CreateIndex
CREATE INDEX "Model_subcategoryId_idx" ON "Model"("subcategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Model_manufacturerId_subcategoryId_name_key" ON "Model"("manufacturerId", "subcategoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_baseSku_key" ON "Product"("baseSku");

-- CreateIndex
CREATE UNIQUE INDEX "Service_internalCode_key" ON "Service"("internalCode");

-- AddForeignKey
ALTER TABLE "SupplierInteraction" ADD CONSTRAINT "SupplierInteraction_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariation" ADD CONSTRAINT "ProductVariation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceCategory" ADD CONSTRAINT "MarketplaceCategory_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "ProductVariation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
