import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

let _prismaClient: PrismaClient | null = null;

function getClient(): PrismaClient {
  if (_prismaClient) return _prismaClient;

  if (globalForPrisma.prisma) {
    _prismaClient = globalForPrisma.prisma;
    return _prismaClient;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required. Check your .env file.');
  }

  _prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = _prismaClient;
  }

  return _prismaClient;
}

const prismaHandler: ProxyHandler<object> = {
  get(_target, prop: string) {
    const client = getClient();
    // eslint-disable-next-line security/detect-object-injection
    const value = (client as unknown as Record<string, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
};

export const prisma = new Proxy({}, prismaHandler) as unknown as PrismaClient;
