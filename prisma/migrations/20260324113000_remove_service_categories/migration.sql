ALTER TABLE "Service" DROP CONSTRAINT IF EXISTS "Service_categoryId_fkey";

ALTER TABLE "Service" DROP COLUMN IF EXISTS "categoryId";

DROP TABLE IF EXISTS "ServiceCategory";
