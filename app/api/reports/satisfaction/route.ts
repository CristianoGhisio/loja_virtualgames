import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { checkAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

type RatingDistributionRow = {
  rating: number;
  count: bigint | number;
};

type SummaryRow = {
  avgRating: Prisma.Decimal | null;
  totalCount: bigint | number;
};

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await checkAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const startDate = start ? new Date(start) : new Date('2000-01-01T00:00:00.000Z');
    const endDate = end ? new Date(end) : new Date();

    const isSchemaGapError = (error: unknown) => {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      return (
        message.includes('does not exist') ||
        message.includes('relation') ||
        message.includes('column') ||
        message.includes('customerfeedbackrequest')
      );
    };

    let saleSummaryRows: SummaryRow[] = [];
    let serviceSummaryRows: SummaryRow[] = [];
    let pendingRows: Array<{ pendingCount: bigint | number }> = [];
    let saleDistributionRows: RatingDistributionRow[] = [];
    let serviceDistributionRows: RatingDistributionRow[] = [];
    let latestSales: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
      customerName: string;
    }> = [];
    let latestServices: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
      customerName: string;
    }> = [];

    try {
      saleSummaryRows = await prisma.$queryRaw<SummaryRow[]>(Prisma.sql`
        SELECT
          AVG("rating")::numeric AS "avgRating",
          COUNT(*)::bigint AS "totalCount"
        FROM "CustomerSaleSatisfaction"
        WHERE "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
      `);
    } catch (error) {
      if (!isSchemaGapError(error)) throw error;
    }

    try {
      serviceSummaryRows = await prisma.$queryRaw<SummaryRow[]>(Prisma.sql`
        SELECT
          AVG("rating")::numeric AS "avgRating",
          COUNT(*)::bigint AS "totalCount"
        FROM "CustomerServiceSatisfaction"
        WHERE "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
      `);
    } catch (error) {
      if (!isSchemaGapError(error)) throw error;
    }

    try {
      pendingRows = await prisma.$queryRaw<Array<{ pendingCount: bigint | number }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS "pendingCount"
        FROM "CustomerFeedbackRequest"
        WHERE "status" = 'PENDING'
      `);
    } catch (error) {
      if (!isSchemaGapError(error)) throw error;
    }

    try {
      saleDistributionRows = await prisma.$queryRaw<RatingDistributionRow[]>(Prisma.sql`
        SELECT "rating", COUNT(*)::bigint AS "count"
        FROM "CustomerSaleSatisfaction"
        WHERE "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
        GROUP BY "rating"
        ORDER BY "rating" ASC
      `);
    } catch (error) {
      if (!isSchemaGapError(error)) throw error;
    }

    try {
      serviceDistributionRows = await prisma.$queryRaw<RatingDistributionRow[]>(Prisma.sql`
        SELECT "rating", COUNT(*)::bigint AS "count"
        FROM "CustomerServiceSatisfaction"
        WHERE "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
        GROUP BY "rating"
        ORDER BY "rating" ASC
      `);
    } catch (error) {
      if (!isSchemaGapError(error)) throw error;
    }

    try {
      latestSales = await prisma.$queryRaw<Array<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        customerName: string;
      }>>(Prisma.sql`
        SELECT
          css."id",
          css."rating",
          css."comment",
          css."createdAt",
          c."name" AS "customerName"
        FROM "CustomerSaleSatisfaction" css
        INNER JOIN "Customer" c ON c."id" = css."customerId"
        WHERE css."createdAt" >= ${startDate}
          AND css."createdAt" <= ${endDate}
        ORDER BY css."createdAt" DESC
        LIMIT 20
      `);
    } catch (error) {
      if (!isSchemaGapError(error)) throw error;
    }

    try {
      latestServices = await prisma.$queryRaw<Array<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        customerName: string;
      }>>(Prisma.sql`
        SELECT
          css."id",
          css."rating",
          css."comment",
          css."createdAt",
          c."name" AS "customerName"
        FROM "CustomerServiceSatisfaction" css
        INNER JOIN "Customer" c ON c."id" = css."customerId"
        WHERE css."createdAt" >= ${startDate}
          AND css."createdAt" <= ${endDate}
        ORDER BY css."createdAt" DESC
        LIMIT 20
        `);
    } catch (error) {
      if (!isSchemaGapError(error)) throw error;
    }

    const saleSummary = saleSummaryRows[0];
    const serviceSummary = serviceSummaryRows[0];

    const saleCount = Number(saleSummary?.totalCount ?? 0);
    const serviceCount = Number(serviceSummary?.totalCount ?? 0);
    const totalResponses = saleCount + serviceCount;
    const pendingRequests = Number(pendingRows[0]?.pendingCount ?? 0);
    const totalRequests = totalResponses + pendingRequests;
    const responseRate = totalRequests > 0 ? (totalResponses / totalRequests) * 100 : 0;

    const salesAvg = Number(saleSummary?.avgRating ?? 0);
    const servicesAvg = Number(serviceSummary?.avgRating ?? 0);
    const overallAvg = totalResponses > 0
      ? ((salesAvg * saleCount) + (servicesAvg * serviceCount)) / totalResponses
      : 0;

    const latest = [
      ...latestSales.map((row) => ({
        ...row,
        type: 'VENDA',
      })),
      ...latestServices.map((row) => ({
        ...row,
        type: 'SERVIÇO',
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    return successResponse({
      summary: {
        overallAverage: overallAvg,
        salesAverage: salesAvg,
        servicesAverage: servicesAvg,
        totalResponses,
        saleResponses: saleCount,
        serviceResponses: serviceCount,
        pendingRequests,
        responseRate,
      },
      distribution: {
        sales: saleDistributionRows.map((row) => ({ rating: row.rating, count: Number(row.count) })),
        services: serviceDistributionRows.map((row) => ({ rating: row.rating, count: Number(row.count) })),
      },
      latest,
      period: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
