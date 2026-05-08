import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

/**
 * Public API routes that do NOT require authentication.
 * All other /api/ routes are protected by default.
 */
const PUBLIC_API_PREFIXES = [
  '/api/auth/',        // NextAuth handlers (login, session, etc.)
  '/api/public/',      // Explicitly public endpoints
  '/api/login/',       // Login page user list (safe data: names, emails, avatars — no passwords)
  '/api/integrations/whatsapp/', // WhatsApp bot webhook
];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;

  // Allow static assets and images
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // Login page and landing page are always public
  if (pathname.startsWith('/login') || pathname === '/') {
    return NextResponse.next();
  }

  // Public API routes bypass authentication
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // For all other routes (including /api/*), require authentication
  if (!req.auth) {
    // API routes get a 401 JSON response
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Page routes get redirected to login
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except static files
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
};
