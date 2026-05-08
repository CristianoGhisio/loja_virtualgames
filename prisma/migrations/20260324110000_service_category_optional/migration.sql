ALTER TABLE "Service" ALTER COLUMN "categoryId" DROP NOT NULL;

ALTER TABLE "Service" DROP CONSTRAINT IF EXISTS "Service_categoryId_fkey";

ALTER TABLE "Service"
ADD CONSTRAINT "Service_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
