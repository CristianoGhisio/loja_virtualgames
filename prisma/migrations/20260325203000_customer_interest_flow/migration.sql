CREATE TABLE IF NOT EXISTS "CustomerInterestFlow" (
  "id" TEXT NOT NULL,
  "funnelCardId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "saleId" TEXT,
  "serviceOrderId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerInterestFlow_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CustomerInterestFlow_funnelCardId_fkey"
    FOREIGN KEY ("funnelCardId") REFERENCES "CustomerFunnelCard"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CustomerInterestFlow_saleId_fkey"
    FOREIGN KEY ("saleId") REFERENCES "Sale"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "CustomerInterestFlow_serviceOrderId_fkey"
    FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CustomerInterestFlow_funnelCardId_kind_key"
  ON "CustomerInterestFlow"("funnelCardId", "kind");

CREATE INDEX IF NOT EXISTS "CustomerInterestFlow_funnelCardId_status_idx"
  ON "CustomerInterestFlow"("funnelCardId", "status");
