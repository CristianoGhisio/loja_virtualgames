/*
  Warnings:

  - You are about to drop the column `allowDiscount` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `allowMarketplace` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionLong` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `requiresDevice` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `requiresParts` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `requiresSerial` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `CustomerFeedbackRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerInterestFlow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerSaleSatisfaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerServiceSatisfaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomerFeedbackRequest" DROP CONSTRAINT "CustomerFeedbackRequest_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerFeedbackRequest" DROP CONSTRAINT "CustomerFeedbackRequest_funnelCardId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerFeedbackRequest" DROP CONSTRAINT "CustomerFeedbackRequest_saleId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerFeedbackRequest" DROP CONSTRAINT "CustomerFeedbackRequest_serviceOrderId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerInterestFlow" DROP CONSTRAINT "CustomerInterestFlow_funnelCardId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerInterestFlow" DROP CONSTRAINT "CustomerInterestFlow_saleId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerInterestFlow" DROP CONSTRAINT "CustomerInterestFlow_serviceOrderId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerSaleSatisfaction" DROP CONSTRAINT "CustomerSaleSatisfaction_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerSaleSatisfaction" DROP CONSTRAINT "CustomerSaleSatisfaction_feedbackRequestId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerSaleSatisfaction" DROP CONSTRAINT "CustomerSaleSatisfaction_saleId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerServiceSatisfaction" DROP CONSTRAINT "CustomerServiceSatisfaction_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerServiceSatisfaction" DROP CONSTRAINT "CustomerServiceSatisfaction_feedbackRequestId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerServiceSatisfaction" DROP CONSTRAINT "CustomerServiceSatisfaction_serviceOrderId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "allowDiscount",
DROP COLUMN "allowMarketplace",
DROP COLUMN "descriptionLong",
DROP COLUMN "requiresDevice",
DROP COLUMN "requiresParts",
DROP COLUMN "requiresSerial";

-- DropTable
DROP TABLE "CustomerFeedbackRequest";

-- DropTable
DROP TABLE "CustomerInterestFlow";

-- DropTable
DROP TABLE "CustomerSaleSatisfaction";

-- DropTable
DROP TABLE "CustomerServiceSatisfaction";
