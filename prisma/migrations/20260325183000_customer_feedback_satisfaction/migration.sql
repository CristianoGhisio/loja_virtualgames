CREATE TABLE IF NOT EXISTS "CustomerFeedbackRequest" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "saleId" TEXT,
  "serviceOrderId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "message" TEXT NOT NULL,
  "responseText" TEXT,
  "respondedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerFeedbackRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CustomerFeedbackRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CustomerFeedbackRequest_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "CustomerFeedbackRequest_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CustomerFeedbackRequest_customerId_status_idx"
  ON "CustomerFeedbackRequest"("customerId", "status");

CREATE TABLE IF NOT EXISTS "CustomerSaleSatisfaction" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "saleId" TEXT NOT NULL,
  "feedbackRequestId" TEXT,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerSaleSatisfaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CustomerSaleSatisfaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CustomerSaleSatisfaction_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CustomerSaleSatisfaction_feedbackRequestId_fkey" FOREIGN KEY ("feedbackRequestId") REFERENCES "CustomerFeedbackRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "CustomerSaleSatisfaction_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS "CustomerSaleSatisfaction_saleId_createdAt_idx"
  ON "CustomerSaleSatisfaction"("saleId", "createdAt");

CREATE TABLE IF NOT EXISTS "CustomerServiceSatisfaction" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "serviceOrderId" TEXT NOT NULL,
  "feedbackRequestId" TEXT,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerServiceSatisfaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CustomerServiceSatisfaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CustomerServiceSatisfaction_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CustomerServiceSatisfaction_feedbackRequestId_fkey" FOREIGN KEY ("feedbackRequestId") REFERENCES "CustomerFeedbackRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "CustomerServiceSatisfaction_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS "CustomerServiceSatisfaction_serviceOrderId_createdAt_idx"
  ON "CustomerServiceSatisfaction"("serviceOrderId", "createdAt");
