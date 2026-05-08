/*
  Warnings:

  - A unique constraint covering the columns `[slug,categoryId]` on the table `Subcategory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Subcategory_slug_key";

-- AlterTable
ALTER TABLE "Subcategory" ALTER COLUMN "slug" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_slug_categoryId_key" ON "Subcategory"("slug", "categoryId");
