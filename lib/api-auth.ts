import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { MOCK_USERS, PERMISSIONS, SessionUser, UserRole } from '@/lib/auth/types';
import { parsePermission } from '@/lib/permissions';

export function hasApiPermission(user: SessionUser | null | undefined, module: string, action?: string): boolean {
  if (!user) return false;

  const parsedInput = parsePermission(module);
  const requiredResource = parsedInput.resource;
  const requiredAction = action?.toLowerCase() || parsedInput.action;

  return (user.permissions || []).some((permission) => {
    const parsedPermission = parsePermission(permission);
    if (parsedPermission.resource !== requiredResource) {
      return false;
    }

    if (!requiredAction) {
      return true;
    }

    if (!parsedPermission.action) {
      return true;
    }

    return parsedPermission.action === requiredAction || parsedPermission.action === 'manage';
  });
}

/**
 * Validate the Origin header to prevent CSRF attacks on mutating requests.
 * Blocks requests with:
 *   - Origin set to an unauthorized domain
 *   - Origin set to "null" (common in CSRF attacks from sandboxed iframes)
 * Allows requests with no Origin header (typical for same-origin GET requests).
 */
function extractHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^www\./, '');
}

function validateOrigin(requestHeaders: Headers): boolean {
  const origin = requestHeaders.get('origin');

  if (!origin) {
    return true;
  }

  if (origin === 'null') {
    return false;
  }

  const requestHostname = extractHostname(origin);
  if (!requestHostname) {
    return false;
  }

  const allowedHostnames = (([
    process.env.NEXTAUTH_URL,
    process.env.INTERNAL_API_URL,
    'http://localhost:3000',
  ]
    .filter(Boolean)
    .map((url) => extractHostname(url as string))
    .filter((h): h is string => h !== null)
    .map(normalizeHostname)));

  return allowedHostnames.some((allowed) => normalizeHostname(requestHostname) === allowed);
}

export async function checkAuth() {
  const requestHeaders = await headers();

  // CSRF protection: validate Origin header
  if (!validateOrigin(requestHeaders)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden: invalid origin' }, { status: 403 }),
      user: null,
    };
  }

  // Mock auth: only allowed in development mode with explicit opt-in AND localhost
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mockEnabled = process.env.ENABLE_MOCK_AUTH === 'true';
  const mockRole = requestHeaders.get('x-mock-role') as UserRole | null;

  // Restrict mock auth to localhost only
  const host = requestHeaders.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1');

  const forwardedFor = requestHeaders.get('x-forwarded-for') || '';
  const realIp = requestHeaders.get('x-real-ip') || '';
  const isLocalIp = forwardedFor.includes('127.0.0.1') || forwardedFor.includes('::1') ||
    realIp.includes('127.0.0.1') || realIp.includes('::1') || realIp.includes('::ffff:127.0.0.1');

  /* eslint-disable security/detect-object-injection */
  if (isDevelopment && mockEnabled && isLocalhost && isLocalIp && mockRole && MOCK_USERS[mockRole]) {
    const mockUser = MOCK_USERS[mockRole];
    const mockPermissions = (PERMISSIONS[mockRole] || []).map((resource) => resource.toLowerCase());
    /* eslint-enable security/detect-object-injection */
    const user = {
      id: mockUser.id,
      role: mockUser.role,
      permissions: mockPermissions,
    };

    return {
      authorized: true,
      session: {
        user,
      },
      user,
    };
  }

  const session = await auth();
  
  if (!session) {
    // Return unauthorized response properly
    return { 
        authorized: false, 
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        user: null 
    };
  }
  
  return { 
      authorized: true, 
      session,
      user: session.user 
  };
}
