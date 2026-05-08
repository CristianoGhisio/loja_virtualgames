import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import type { RateLimitConfig } from '@/lib/rate-limit';
import { runWithRequestId } from '@/lib/request-id';
import { ErrorCodes } from '@/lib/error-codes';

type WithSecurityConfig = {
  rateLimit?: RateLimitConfig;
  skipOrigin?: boolean;
};

type ApiHandler<P extends Record<string, string> = Record<string, string>> = (
  req: NextRequest,
  ctx: { params: Promise<P> }
) => Promise<NextResponse>;

const ALLOWED_ORIGINS = (() => {
  const origins = [
    process.env.NEXTAUTH_URL,
    process.env.INTERNAL_API_URL,
    'http://localhost:3000',
  ].filter(Boolean) as string[];
  return origins;
})();

function validateOrigin(req: NextRequest): { valid: boolean; status?: number; code?: string; error?: string } {
  if (ALLOWED_ORIGINS.length === 0) {
    return { valid: true };
  }

  const origin = req.headers.get('origin');
  if (!origin) {
    return { valid: true };
  }

  if (origin === 'null') {
    return { valid: false, status: 403, code: ErrorCodes.ACCESS_DENIED, error: 'Forbidden: invalid origin' };
  }

  if (!ALLOWED_ORIGINS.some((allowed) => origin === allowed)) {
    return { valid: false, status: 403, code: ErrorCodes.ACCESS_DENIED, error: 'Forbidden: invalid origin' };
  }

  return { valid: true };
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function withSecurity<P extends Record<string, string> = Record<string, string>>(
  handler: ApiHandler<P>,
  config?: WithSecurityConfig
): ApiHandler<P> {
  return async (req: NextRequest, ctx: { params: Promise<P> }): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const path = new URL(req.url).pathname;
    const method = req.method;

    return runWithRequestId(requestId, async () => {
      try {
        if (MUTATING_METHODS.has(method) && !config?.skipOrigin) {
          const originCheck = validateOrigin(req);
          if (!originCheck.valid) {
            const response = NextResponse.json(
              { success: false, error: originCheck.error!, code: originCheck.code! },
              { status: originCheck.status! }
            );
            response.headers.set('x-request-id', requestId);
            logRequest(requestId, method, path, originCheck.status!, Date.now() - startTime, 'warn');
            return response;
          }
        }

        const effectiveRateLimit = config?.rateLimit || RATE_LIMITS.api;
        const ip = getClientIp(req);
        const rateLimitKey = `${method}:${path}:${ip}`;
        const rlResult = rateLimit(rateLimitKey, effectiveRateLimit);

        if (!rlResult.allowed) {
          const retryAfter = Math.ceil(rlResult.retryAfterMs / 1000);
          const response = NextResponse.json(
            { success: false, error: 'Too many requests', code: ErrorCodes.RATE_LIMIT_EXCEEDED },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
          );
          response.headers.set('x-request-id', requestId);
          logRequest(requestId, method, path, 429, Date.now() - startTime, 'warn');
          return response;
        }

        const response = await handler(req, ctx);

        response.headers.set('x-request-id', requestId);

        const duration = Date.now() - startTime;
        logRequest(requestId, method, path, response.status, duration);

        return response;

      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        console.error(JSON.stringify({
          requestId,
          level: 'error',
          method,
          path,
          duration: `${duration}ms`,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }));

        const errorResp = errorResponse(error, 500);
        errorResp.headers.set('x-request-id', requestId);
        return errorResp;
      }
    });
  };
}

function logRequest(
  requestId: string,
  method: string,
  path: string,
  status: number,
  durationMs: number,
  level: string = 'info'
): void {
  const logFn = level === 'warn' ? console.warn : level === 'error' ? console.error : console.log;
  logFn(JSON.stringify({
    requestId,
    level,
    method,
    path,
    status,
    duration: `${durationMs}ms`,
    timestamp: new Date().toISOString(),
  }));
}
