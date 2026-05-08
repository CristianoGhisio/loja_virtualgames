-- CreateEnum
CREATE TYPE "ReceivableOrigin" AS ENUM ('MANUAL', 'SALE', 'SERVICE');

-- CreateEnum
CREATE TYPE "PayableType" AS ENUM ('DEFAULT', 'TECHNICIAN_COMMISSION');

-- CreateEnum
CREATE TYPE "ServiceCommissionStatus" AS ENUM ('PROVISIONED', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Payable" ADD COLUMN     "competenceMonth" INTEGER,
ADD COLUMN     "competenceYear" INTEGER,
ADD COLUMN     "payableType" "PayableType" NOT NULL DEFAULT 'DEFAULT',
ADD COLUMN     "technicianUserId" TEXT;

-- AlterTable
ALTER TABLE "Receivable" ADD COLUMN     "origin" "ReceivableOrigin" NOT NULL DEFAULT 'MANUAL';

-- CreateTable
CREATE TABLE "ServiceCommissionProvision" (
    "id" TEXT NOT NULL,
    "serviceOrderId" TEXT NOT NULL,
    "serviceOrderItemId" TEXT NOT NULL,
    "serviceId" TEXT,
    "technicianUserId" TEXT NOT NULL,
    "competenceMonth" INTEGER NOT NULL,
    "competenceYear" INTEGER NOT NULL,
    "baseAmount" DECIMAL(10,2) NOT NULL,
    "commissionPercent" DECIMAL(5,2) NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL,
    "status" "ServiceCommissionStatus" NOT NULL DEFAULT 'PROVISIONED',
    "paidAt" TIMESTAMP(3),
    "payableId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCommissionProvision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceCommissionProvision_technicianUserId_competenceYear__idx" ON "ServiceCommissionProvision"("technicianUserId", "competenceYear", "competenceMonth", "status");

-- CreateIndex
CREATE INDEX "ServiceCommissionProvision_status_paidAt_idx" ON "ServiceCommissionProvision"("status", "paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCommissionProvision_serviceOrderItemId_technicianUse_key" ON "ServiceCommissionProvision"("serviceOrderItemId", "technicianUserId");

-- CreateIndex
CREATE INDEX "Receivable_origin_paidAt_idx" ON "Receivable"("origin", "paidAt");
