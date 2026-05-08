FROM node:20-slim AS base
LABEL maintainer="Virtual Games"

FROM base AS deps
WORKDIR /app
RUN apt-get update -qq \
    && apt-get install -y -qq --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}
ENV DATABASE_URL=postgresql://build:dummy@localhost:5432/build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

RUN apt-get update -qq \
    && apt-get install -y -qq --no-install-recommends \
      postgresql-client \
      ca-certificates \
      chromium \
      fonts-liberation \
      libasound2 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libcups2 \
      libdrm2 \
      libgbm1 \
      libnspr4 \
      libnss3 \
      libpango-1.0-0 \
      libxcomposite1 \
      libxdamage1 \
      libxrandr2 \
      libxshmfence1 \
      curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

COPY scripts/entrypoint.prod.sh /app/scripts/entrypoint.prod.sh
RUN sed -i 's/\r$//' /app/scripts/entrypoint.prod.sh \
    && chmod 755 /app/scripts/entrypoint.prod.sh \
    && chown nextjs:nodejs /app/scripts/entrypoint.prod.sh

RUN mkdir -p /app/.next/cache /app/.wwebjs_auth /app/.wwebjs_cache /app/storage /app/.npm \
    && mkdir -p /home/nextjs/.npm \
    && chown -R nextjs:nodejs /app /home/nextjs

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD ["sh", "/app/scripts/entrypoint.prod.sh"]
