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
  '/api/health',
];

const PUBLIC_PAGE_PREFIXES = [
  '/blog',
  '/servicos',
  '/acompanhar-reparo',
  '/sobre',
  '/faq',
  '/garantia',
  '/contato',
  '/privacidade',
  '/termos',
  '/campeonatos',
  '/assistencia-tecnica-santa-maria',
  '/garantias',
];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next/') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.xml') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.txt') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname === '/llms.txt' ||
    pathname === '/ai.txt'
  ) {
    return NextResponse.next();
  }

  if (pathname === '/' || pathname.startsWith('/login') || isPublicPage(pathname)) {
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
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$|.*\\.txt$).*)'],
};
