
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Rate limiting for public endpoint
    const clientIp = getClientIp(req);
    const rateLimitResult = rateLimit(`public-os:${clientIp}`, RATE_LIMITS.public);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
          },
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
      return errorResponse('Query parameter is required', 400);
    }

    // Sanitize query just in case frontend missed it
    const sanitizedQuery = query.replace(/#/g, '').trim();

    // Search by ID (exact match) or ID suffix (last 6 chars)
    const os = await prisma.serviceOrder.findFirst({
      where: {
        OR: [
          { id: sanitizedQuery },
          { id: { endsWith: sanitizedQuery, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        device: true,
        status: true,
        defect: true,
        total: true,
        technician: {
          select: {
            name: true
          }
        },
        customer: {
          select: {
            name: true,
            // DO NOT expose document directly, only use for backend verification later
          }
        }
      }
    });

    if (!os) {
      return errorResponse('Ordem de Serviço não encontrada', 404);
    }

    return successResponse(os);
  } catch {
    // Public endpoint: never leak internal errors.
    return errorResponse('Ordem de Serviço não encontrada', 404);
  }
}
