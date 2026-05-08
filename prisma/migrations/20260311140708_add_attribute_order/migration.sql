/*
  Warnings:

  - You are about to drop the column `referenceCode` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `releaseYear` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `costBase` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "referenceCode",
DROP COLUMN "releaseYear";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "costBase";

-- CreateTable
CREATE TABLE "_ManufacturerToSubcategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToModel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ManufacturerToSubcategory_AB_unique" ON "_ManufacturerToSubcategory"("A", "B");

-- CreateIndex
CREATE INDEX "_ManufacturerToSubcategory_B_index" ON "_ManufacturerToSubcategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToModel_AB_unique" ON "_AttributeToModel"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToModel_B_index" ON "_AttributeToModel"("B");

-- AddForeignKey
ALTER TABLE "_ManufacturerToSubcategory" ADD CONSTRAINT "_ManufacturerToSubcategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManufacturerToSubcategory" ADD CONSTRAINT "_ManufacturerToSubcategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToModel" ADD CONSTRAINT "_AttributeToModel_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToModel" ADD CONSTRAINT "_AttributeToModel_B_fkey" FOREIGN KEY ("B") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
