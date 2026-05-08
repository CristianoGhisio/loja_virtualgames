import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

const PUBLIC_API_PREFIXES = [
  '/api/auth/',
  '/api/public/',
  '/api/login/',
  '/api/integrations/whatsapp/',
  '/api/health/',
];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/login') || pathname === '/') {
    return NextResponse.next();
  }

  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
};
