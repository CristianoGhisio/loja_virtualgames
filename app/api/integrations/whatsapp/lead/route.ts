import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { timingSafeEqual } from 'node:crypto';


export const dynamic = 'force-dynamic';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function buildLeadDocument(phone: string): string {
  const suffix = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return `LEAD-WPP-${phone}-${suffix}`;
}

function extractRating(rawMessage: string): { rating: number; comment: string | null } | null {
  // eslint-disable-next-line security/detect-unsafe-regex
  const match = rawMessage.trim().match(/^([1-5])(?:\s*[-:]\s*|\s+)?(.*)$/);
  if (!match) return null;
  const rating = Number(match[1]);
  if (Number.isNaN(rating) || rating < 1 || rating > 5) return null;
  const comment = (match[2] ?? '').trim();
  return { rating, comment: comment || null };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for webhook
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`whatsapp-lead:${clientIp}`, RATE_LIMITS.public);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)) } }
      );
    }

    const expectedToken = process.env.WHATSAPP_BOT_TOKEN ?? '';
    const receivedToken = request.headers.get('x-bot-token') ?? '';

    // Use timing-safe comparison to prevent timing attacks
    if (
      !expectedToken ||
      expectedToken.length !== receivedToken.length ||
      !timingSafeEqual(Buffer.from(expectedToken), Buffer.from(receivedToken))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: unknown;
      phone?: unknown;
      message?: unknown;
    };

    const name = String(body.name ?? '').trim();
    const message = String(body.message ?? '').trim();
    const phone = normalizePhone(String(body.phone ?? '').trim());

    if (!name || !message || !phone) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const stage = 'NOVO_CONTATO';

    const result = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({
        where: { phone },
        select: { id: true, name: true, phone: true },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name,
            phone,
            document: buildLeadDocument(phone),
            type: 'PF',
            active: true,
          },
          select: { id: true, name: true, phone: true },
        });
      }

      const activeCard = await tx.customerFunnelCard.findFirst({
        where: {
          customerId: customer.id,
          active: true,
          stage: { not: 'FINALIZADO' },
        },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });

      const isMenuChoice = message === '1' || message === '2' || message === '3';

      if (activeCard && !isMenuChoice) {
        const parsedRating = extractRating(message);
        if (parsedRating) {
          try {
            const pendingRequests = await tx.$queryRaw<Array<{
              id: string;
              targetType: string;
              saleId: string | null;
              serviceOrderId: string | null;
              funnelCardId: string | null;
            }>>(Prisma.sql`
              SELECT
                "id",
                "targetType",
                "saleId",
                "serviceOrderId",
                "funnelCardId"
              FROM "CustomerFeedbackRequest"
              WHERE "customerId" = ${customer.id}
                AND "status" = 'PENDING'
              ORDER BY "createdAt" DESC
              LIMIT 1
            `);

            const pending = pendingRequests[0];

            if (pending) {
              if (pending.targetType === 'SALE' && pending.saleId) {
                await tx.$executeRaw(Prisma.sql`
                  INSERT INTO "CustomerSaleSatisfaction"
                    ("id", "customerId", "saleId", "feedbackRequestId", "rating", "comment", "channel", "createdAt")
                  VALUES
                    (${crypto.randomUUID()}, ${customer.id}, ${pending.saleId}, ${pending.id}, ${parsedRating.rating}, ${parsedRating.comment}, 'WHATSAPP', NOW())
                `);
              }

              if (pending.targetType === 'SERVICE' && pending.serviceOrderId) {
                await tx.$executeRaw(Prisma.sql`
                  INSERT INTO "CustomerServiceSatisfaction"
                    ("id", "customerId", "serviceOrderId", "feedbackRequestId", "rating", "comment", "channel", "createdAt")
                  VALUES
                    (${crypto.randomUUID()}, ${customer.id}, ${pending.serviceOrderId}, ${pending.id}, ${parsedRating.rating}, ${parsedRating.comment}, 'WHATSAPP', NOW())
                `);
              }

              await tx.$executeRaw(Prisma.sql`
                UPDATE "CustomerFeedbackRequest"
                SET
                  "status" = 'RESPONDED',
                  "responseText" = ${message},
                  "respondedAt" = NOW(),
                  "updatedAt" = NOW()
                WHERE "id" = ${pending.id}
              `);

              await tx.customerInteraction.create({
                data: {
                  customerId: customer.id,
                  type: 'PESQUISA_SATISFACAO',
                  content: `Resposta de pesquisa recebida: nota ${parsedRating.rating}${parsedRating.comment ? ` - ${parsedRating.comment}` : ''}`,
                },
              });

              if (pending.funnelCardId) {
                await tx.customerFunnelCard.updateMany({
                  where: {
                    id: pending.funnelCardId,
                    customerId: customer.id,
                  },
                  data: {
                    active: false,
                    archivedAt: new Date(),
                  },
                });

                await tx.customerInteraction.create({
                  data: {
                    customerId: customer.id,
                    type: 'CRM',
                    content: 'Card de Solicitar Feedbackk finalizado após resposta da pesquisa.',
                  },
                });
              }

              return { customerId: customer.id, handledAsSurvey: true, hasActiveCard: true };
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (!errorMessage.includes('CustomerFeedbackRequest')) {
              throw error;
            }
          }
        }

        await tx.customerInteraction.create({
          data: {
            customerId: customer.id,
            type: 'WHATSAPP',
            content: message,
          },
        });

        await tx.customerFunnelCard.update({
          where: { id: activeCard.id },
          data: { hasNewMessage: true },
        });

        return { customerId: customer.id, hasActiveCard: true };
      }

      if (isMenuChoice) {
        const interestMap: Record<string, { type: string; label: string }> = {
          '1': { type: 'PRODUCT', label: 'Produtos' },
          '2': { type: 'SERVICE', label: 'Serviços' },
          '3': { type: 'BOLETO', label: 'Boleto Bancário' },
        };
        // eslint-disable-next-line security/detect-object-injection
        const choice = interestMap[message];
        const interestType = choice.type;
        const interestLabel = choice.label;

        const existingCard = await tx.customerFunnelCard.findFirst({
          where: {
            customerId: customer.id,
            active: true,
            stage,
          },
          select: { id: true },
          orderBy: { createdAt: 'desc' },
        });

        let cardId = existingCard?.id;

        if (!cardId) {
          const createdCard = await tx.customerFunnelCard.create({
            data: {
              customerId: customer.id,
              stage,
              itemInterest: `Interessado em ${interestLabel} (WhatsApp)`,
              active: true,
            },
            select: { id: true },
          });
          cardId = createdCard.id;
        } else {
          await tx.customerFunnelCard.update({
            where: { id: cardId },
            data: {
              itemInterest: `Interessado em ${interestLabel} (WhatsApp)`,
            },
          });
        }

        await tx.customerInteraction.create({
          data: {
            customerId: customer.id,
            type: 'WHATSAPP',
            content: `Cliente optou por: Interesse em ${interestLabel} (via WhatsApp)`,
          },
        });

        return { customerId: customer.id, cardId, handledAsMenu: true, interestType };
      }

      const parsedRating = extractRating(message);
      if (parsedRating) {
        try {
          const pendingRequests = await tx.$queryRaw<Array<{
            id: string;
            targetType: string;
            saleId: string | null;
            serviceOrderId: string | null;
            funnelCardId: string | null;
          }>>(Prisma.sql`
            SELECT
              "id",
              "targetType",
              "saleId",
              "serviceOrderId",
              "funnelCardId"
            FROM "CustomerFeedbackRequest"
            WHERE "customerId" = ${customer.id}
              AND "status" = 'PENDING'
            ORDER BY "createdAt" DESC
            LIMIT 1
          `);

          const pending = pendingRequests[0];

          if (pending) {
            if (pending.targetType === 'SALE' && pending.saleId) {
              await tx.$executeRaw(Prisma.sql`
                INSERT INTO "CustomerSaleSatisfaction"
                  ("id", "customerId", "saleId", "feedbackRequestId", "rating", "comment", "channel", "createdAt")
                VALUES
                  (${crypto.randomUUID()}, ${customer.id}, ${pending.saleId}, ${pending.id}, ${parsedRating.rating}, ${parsedRating.comment}, 'WHATSAPP', NOW())
              `);
            }

            if (pending.targetType === 'SERVICE' && pending.serviceOrderId) {
              await tx.$executeRaw(Prisma.sql`
                INSERT INTO "CustomerServiceSatisfaction"
                  ("id", "customerId", "serviceOrderId", "feedbackRequestId", "rating", "comment", "channel", "createdAt")
                VALUES
                  (${crypto.randomUUID()}, ${customer.id}, ${pending.serviceOrderId}, ${pending.id}, ${parsedRating.rating}, ${parsedRating.comment}, 'WHATSAPP', NOW())
              `);
            }

            await tx.$executeRaw(Prisma.sql`
              UPDATE "CustomerFeedbackRequest"
              SET
                "status" = 'RESPONDED',
                "responseText" = ${message},
                "respondedAt" = NOW(),
                "updatedAt" = NOW()
              WHERE "id" = ${pending.id}
            `);

            await tx.customerInteraction.create({
              data: {
                customerId: customer.id,
                type: 'PESQUISA_SATISFACAO',
                content: `Resposta de pesquisa recebida: nota ${parsedRating.rating}${parsedRating.comment ? ` - ${parsedRating.comment}` : ''}`,
              },
            });

            if (pending.funnelCardId) {
              await tx.customerFunnelCard.updateMany({
                where: {
                  id: pending.funnelCardId,
                  customerId: customer.id,
                },
                data: {
                  active: false,
                  archivedAt: new Date(),
                },
              });

              await tx.customerInteraction.create({
                data: {
                  customerId: customer.id,
                  type: 'CRM',
                  content: 'Card de Solicitar Feedbackk finalizado após resposta da pesquisa.',
                },
              });
            }

            return { customerId: customer.id, handledAsSurvey: true };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (!errorMessage.includes('CustomerFeedbackRequest')) {
            throw error;
          }
        }
      }

      const existingCard = await tx.customerFunnelCard.findFirst({
        where: {
          customerId: customer.id,
          active: true,
          stage,
        },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });

      let cardId = existingCard?.id;

      if (!cardId) {
        const createdCard = await tx.customerFunnelCard.create({
          data: {
            customerId: customer.id,
            stage,
            sellerNote: message,
            active: true,
          },
          select: { id: true },
        });
        cardId = createdCard.id;
      } else {
        await tx.customerFunnelCard.update({
          where: { id: cardId },
          data: {
            sellerNote: message,
          },
        });
      }

      await tx.customerInteraction.create({
        data: {
          customerId: customer.id,
          type: 'WHATSAPP',
          content: message,
        },
      });

      return { customerId: customer.id, cardId, handledAsSurvey: false };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Integration error' },
      { status: 500 }
    );
  }
}
