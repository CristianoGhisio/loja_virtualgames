CREATE TYPE "FunnelStage" AS ENUM ('NOVO_CONTATO', 'EM_ANDAMENTO', 'CONTATO_QUENTE', 'VENDA_CONCLUIDA');

CREATE TABLE "CustomerFunnelCard" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "stage" "FunnelStage" NOT NULL DEFAULT 'NOVO_CONTATO',
  "sellerNote" TEXT,
  "itemInterest" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastStageChangeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CustomerFunnelCard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerFunnelCard_customerId_active_idx" ON "CustomerFunnelCard"("customerId", "active");
CREATE INDEX "CustomerFunnelCard_stage_active_idx" ON "CustomerFunnelCard"("stage", "active");

ALTER TABLE "CustomerFunnelCard"
ADD CONSTRAINT "CustomerFunnelCard_customerId_fkey"
FOREIGN KEY ("customerId")
REFERENCES "Customer"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
