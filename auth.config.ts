import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
      },
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isPublicPath = nextUrl.pathname.startsWith('/login');
      if (isPublicPath) {
        return true;
      }
      return !!auth?.user;
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      if (token.permissions && session.user) {
        session.user.permissions = token.permissions;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions || [];
      }
      return token;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
