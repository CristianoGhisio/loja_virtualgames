-- Add new direct relations on Product
ALTER TABLE "Product"
ADD COLUMN "categoryId" TEXT,
ADD COLUMN "manufacturerId" TEXT;

-- Backfill Product relations from Model/Subcategory
UPDATE "Product" AS p
SET
  "manufacturerId" = m."manufacturerId",
  "categoryId" = s."categoryId"
FROM "Model" AS m
JOIN "Subcategory" AS s ON s."id" = m."subcategoryId"
WHERE p."modelId" = m."id";

-- Enforce required fields
ALTER TABLE "Product"
ALTER COLUMN "categoryId" SET NOT NULL,
ALTER COLUMN "manufacturerId" SET NOT NULL;

-- Create indexes and foreign keys
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_manufacturerId_idx" ON "Product"("manufacturerId");

ALTER TABLE "Product"
ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT "Product_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove old Product -> Model relation
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_modelId_fkey";
DROP INDEX IF EXISTS "Product_modelId_idx";
ALTER TABLE "Product" DROP COLUMN "modelId";

-- Remove relation table and model table
DROP TABLE IF EXISTS "_AttributeToModel";
DROP TABLE IF EXISTS "Model";

-- Remove MODEL from AttributeEntitySource enum
ALTER TABLE "Attribute" ALTER COLUMN "entitySource" DROP DEFAULT;
ALTER TYPE "AttributeEntitySource" RENAME TO "AttributeEntitySource_old";
CREATE TYPE "AttributeEntitySource" AS ENUM ('NONE', 'MANUFACTURER', 'SUPPLIER', 'CATEGORY');
ALTER TABLE "Attribute"
ALTER COLUMN "entitySource" TYPE "AttributeEntitySource"
USING (
  CASE
    WHEN "entitySource"::text = 'MODEL' THEN 'NONE'
    ELSE "entitySource"::text
  END
)::"AttributeEntitySource";
ALTER TABLE "Attribute" ALTER COLUMN "entitySource" SET DEFAULT 'NONE';
DROP TYPE "AttributeEntitySource_old";
