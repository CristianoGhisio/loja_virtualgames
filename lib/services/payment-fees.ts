import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type NormalizedPaymentMethod =
  | 'PIX'
  | 'DINHEIRO'
  | 'CREDITO'
  | 'DEBITO'
  | 'CARTAO'
  | 'CREDITO_LOJA';

export type PaymentFeeConfig = {
  creditFixedFee: number;
  creditVariableFee: number;
  debitFixedFee: number;
  debitVariableFee: number;
};

const defaultPaymentFeeConfig: PaymentFeeConfig = {
  creditFixedFee: 0,
  creditVariableFee: 0,
  debitFixedFee: 0,
  debitVariableFee: 0,
};

export const normalizePaymentMethod = (value: string): NormalizedPaymentMethod => {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'PIX') return 'PIX';
  if (normalized === 'DINHEIRO' || normalized === 'CASH') return 'DINHEIRO';
  if (normalized === 'CREDITO' || normalized === 'CREDIT') return 'CREDITO';
  if (normalized === 'DEBITO' || normalized === 'DEBIT') return 'DEBITO';
  if (normalized === 'CARTAO' || normalized === 'CARD') return 'CARTAO';
  if (normalized === 'CREDITO_LOJA' || normalized === 'STORE_CREDIT') return 'CREDITO_LOJA';
  return 'DINHEIRO';
};

const toNumber = (value: Prisma.Decimal | number | string | null | undefined): number => Number(value ?? 0);

export async function getPaymentFeeConfig(client: Prisma.TransactionClient | typeof prisma = prisma): Promise<PaymentFeeConfig> {
  const tableCheck = await client.$queryRaw<Array<{ regclass: string | null }>>(Prisma.sql`
    SELECT to_regclass('public."PaymentFeeSettings"')::text AS regclass
  `);
  if (!tableCheck[0]?.regclass) return defaultPaymentFeeConfig;

  const rows = await client.$queryRaw<Array<{
    creditFixedFee: Prisma.Decimal | number | string | null;
    creditVariableFee: Prisma.Decimal | number | string | null;
    debitFixedFee: Prisma.Decimal | number | string | null;
    debitVariableFee: Prisma.Decimal | number | string | null;
  }>>(Prisma.sql`
    SELECT
      "creditFixedFee",
      "creditVariableFee",
      "debitFixedFee",
      "debitVariableFee"
    FROM "PaymentFeeSettings"
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `);

  const settings = rows[0];
  if (!settings) return defaultPaymentFeeConfig;

  return {
    creditFixedFee: toNumber(settings.creditFixedFee),
    creditVariableFee: toNumber(settings.creditVariableFee),
    debitFixedFee: toNumber(settings.debitFixedFee),
    debitVariableFee: toNumber(settings.debitVariableFee),
  };
}

export async function calculateNetForPayment(
  client: Prisma.TransactionClient | typeof prisma,
  grossValue: number,
  paymentMethod: string,
  manualPercent?: number
) {
  const method = normalizePaymentMethod(paymentMethod);
  const gross = Number(grossValue);
  const config = await getPaymentFeeConfig(client);

  let fixedFee = 0;
  let variablePercent = 0;

  if (method === 'CREDITO' || method === 'CARTAO') {
    fixedFee = config.creditFixedFee;
    variablePercent = manualPercent ?? config.creditVariableFee;
  } else if (method === 'DEBITO') {
    fixedFee = config.debitFixedFee;
    variablePercent = manualPercent ?? config.debitVariableFee;
  } else {
    fixedFee = 0;
    variablePercent = 0;
  }

  const variableFeeValue = Number(((gross * variablePercent) / 100).toFixed(2));
  const feeValue = Number((fixedFee + variableFeeValue).toFixed(2));
  const netValue = Number(Math.max(gross - feeValue, 0).toFixed(2));

  return {
    paymentMethod: method,
    cardFeePercent: variablePercent,
    cardFeeValue: feeValue,
    netValue,
  };
}
