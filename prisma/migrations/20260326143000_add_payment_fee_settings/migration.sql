CREATE TABLE "PaymentFeeSettings" (
    "id" TEXT NOT NULL,
    "creditFixedFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "creditVariableFee" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "debitFixedFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "debitVariableFee" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentFeeSettings_pkey" PRIMARY KEY ("id")
);
