ALTER TABLE "CustomerFeedbackRequest"
ADD COLUMN IF NOT EXISTS "funnelCardId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CustomerFeedbackRequest_funnelCardId_fkey'
  ) THEN
    ALTER TABLE "CustomerFeedbackRequest"
    ADD CONSTRAINT "CustomerFeedbackRequest_funnelCardId_fkey"
    FOREIGN KEY ("funnelCardId")
    REFERENCES "CustomerFunnelCard"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "CustomerFeedbackRequest_funnelCardId_idx"
  ON "CustomerFeedbackRequest"("funnelCardId");
