import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

type PermissionEntry = {
  action: string;
  resource: string;
};

type EmployeeProfile = {
  nomeCompleto: string;
  fotoUrl: string | null;
};

function toPermissionTokens(permissions: PermissionEntry[]): string[] {
  const tokens = new Set<string>();

  permissions.forEach((permission) => {
    const action = permission.action.toLowerCase();
    const resource = permission.resource.toLowerCase();

    tokens.add(resource);
    tokens.add(`${action}:${resource}`);
  });

  return Array.from(tokens);
}

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: {
                  select: {
                    action: true,
                    resource: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

async function getEmployeeProfileByUserId(userId: string): Promise<EmployeeProfile | null> {
  try {
    const employee = await prisma.employee.findFirst({
      where: { userId },
      select: {
        nomeCompleto: true,
        fotoUrl: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    if (!employee) return null;
    return employee;
  } catch (error) {
    console.error('Failed to fetch employee profile by user id:', error);
    return null;
  }
}

async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: {
                  select: {
                    action: true,
                    resource: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user by id:', error);
    return null;
  }
}

let _nextAuth: ReturnType<typeof NextAuth> | null = null;

function getNextAuth(): ReturnType<typeof NextAuth> {
  if (_nextAuth) return _nextAuth;
  _nextAuth = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions || [];
        token.name = user.name;
        token.picture = user.image || null;
        return token;
      }

      if (!token.sub) return token;

      const dbUser = await getUserById(token.sub);
      if (!dbUser) return token;

      token.role = dbUser.role.name;
      token.permissions = toPermissionTokens(
        dbUser.role.permissions.map((item) => item.permission)
      );
      const employeeProfile = await getEmployeeProfileByUserId(dbUser.id);
      token.name = employeeProfile?.nomeCompleto || dbUser.name || token.name || '';
      token.picture = employeeProfile?.fotoUrl || token.picture || null;
      return token;
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
      if (session.user) {
        session.user.name = token.name || session.user.name || '';
        session.user.image = typeof token.picture === 'string' ? token.picture : session.user.image || null;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          if (!user.password) return null;

          // Check if account is locked due to too many failed attempts
          const MAX_LOGIN_ATTEMPTS = 5;
          const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

          if (user.lockedUntil && user.lockedUntil > new Date()) {
            const remainingMs = user.lockedUntil.getTime() - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);
            console.log(`Account locked: ${email}. Retry in ${remainingMin} minutes.`);
            throw new Error(`Conta temporariamente bloqueada. Tente novamente em ${remainingMin} minuto(s).`);
          }

          // If lockout expired, reset the counter
          if (user.lockedUntil && user.lockedUntil <= new Date()) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                lockedUntil: null,
                failedLoginAttempts: 0,
              },
            });
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
 
          if (passwordsMatch) {
            // Reset failed attempts on successful login
            if (user.failedLoginAttempts > 0) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  failedLoginAttempts: 0,
                  lockedUntil: null,
                },
              });
            }

            const permissions = toPermissionTokens(
              user.role.permissions.map((item) => item.permission)
            );
            const employeeProfile = await getEmployeeProfileByUserId(user.id);

            return {
              id: user.id,
              name: employeeProfile?.nomeCompleto || user.name,
              email: user.email,
              image: employeeProfile?.fotoUrl || null,
              role: user.role.name,
              permissions,
            };
          }

          // Increment failed login attempts and potentially lock account
          const newAttempts = user.failedLoginAttempts + 1;

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: newAttempts,
                lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
              },
            });
            console.log(`Account locked due to ${newAttempts} failed attempts: ${email}`);
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: newAttempts,
              },
            });
          }
        }
 
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  });
  return _nextAuth;
}

export const handlers = {
  get GET() { return getNextAuth().handlers.GET; },
  get POST() { return getNextAuth().handlers.POST; },
};

export async function auth(...args: unknown[]) {
  return (getNextAuth().auth as (...a: unknown[]) => unknown)(...args);
}

export const signIn = ((...args: unknown[]) => {
  return (getNextAuth().signIn as (...a: unknown[]) => unknown)(...args);
}) as (...args: unknown[]) => unknown;

export const signOut = ((...args: unknown[]) => {
  return (getNextAuth().signOut as (...a: unknown[]) => unknown)(...args);
}) as (...args: unknown[]) => unknown;
