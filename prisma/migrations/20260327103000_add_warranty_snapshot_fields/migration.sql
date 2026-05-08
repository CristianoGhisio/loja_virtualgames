ALTER TABLE "Service"
ADD COLUMN "warrantyMonths" INTEGER;

ALTER TABLE "SaleItem"
ADD COLUMN "warrantyMonths" INTEGER;

ALTER TABLE "ServiceOrderItem"
ADD COLUMN "warrantyMonths" INTEGER;
