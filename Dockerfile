##### DEPENDENCIES

FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl1.1-compat
WORKDIR /app

# Install Prisma Client - remove if not using Prisma

COPY prisma ./

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml\* ./

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### BUILDER

FROM node:18-alpine AS builder

# Prisma
ARG DATABASE_URL
# Next Auth
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
# Next Auth Google Provider
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
# Next Auth Email Provider
ARG EMAIL_SERVER
ARG EMAIL_FROM
# MinIO Configuration
ARG MINIO_ACCESS_KEY
ARG MINIO_SECRET_KEY
ARG MINIO_END_POINT
ARG MINIO_PORT
ARG MINIO_USE_SSL
ARG MINIO_BUCKET_NAME

# Pusher Configuration
ARG PUSHER_APP_ID
ARG PUSHER_APP_KEY
ARG PUSHER_CLUSTER
ARG PUSHER_SECRET
ARG PUSHER_USE_TLS
ARG PUSHER_HOST
ARG PUSHER_PORT

ARG NEXT_PUBLIC_SITE_URL
# MINIO Public Information
ARG NEXT_PUBLIC_MINIO_ENDPOINT
ARG NEXT_PUBLIC_MINIO_BUCKET
# Pusher Public Information
ARG NEXT_PUBLIC_PUSHER_APP_KEY
ARG NEXT_PUBLIC_PUSHER_APP_CLUSTER
ARG NEXT_PUBLIC_PUSHER_FORCE_TLS
ARG NEXT_PUBLIC_PUSHER_WS_HOST
ARG NEXT_PUBLIC_PUSHER_WS_PORT

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN \
    if [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 yarn build; \
    elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 npm run build; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && SKIP_ENV_VALIDATION=1 pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### DEVELOPMENT

FROM node:18-alpine AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "run", "dev"]

##### PRODUCTION

FROM node:18-alpine AS production
WORKDIR /app

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
