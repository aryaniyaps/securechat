##### DEPENDENCIES

FROM node:18-alpine3.17 AS deps
RUN apk add --no-cache libc6-compat openssl1.1-compat
WORKDIR /app

# Install Prisma Client - remove if not using Prisma

COPY prisma ./

# Install dependencies based on the preferred package manager

COPY package.json package-lock.json* ./

RUN npm ci

##### BUILDER

FROM node:18-alpine3.17 AS builder

# Prisma
ARG DATABASE_URL
# Next Auth
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG NEXTAUTH_URL_INTERNAL
# Next Auth Google Provider
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
# Next Auth Email Provider
ARG EMAIL_SERVER
ARG EMAIL_FROM
# S3 Configuration
ARG S3_ACCESS_KEY
ARG S3_SECRET_KEY
ARG S3_END_POINT
ARG S3_AVATAR_BUCKET_NAME
ARG S3_MEDIA_BUCKET_NAME

# RabbitMQ Configuration
ARG RABBITMQ_URL
ARG RABBITMQ_QUEUE_NAME

ARG NEXT_PUBLIC_SITE_URL

# S3 Public Information
ARG NEXT_PUBLIC_S3_ENDPOINT
ARG NEXT_PUBLIC_S3_AVATAR_BUCKET
ARG NEXT_PUBLIC_S3_MEDIA_BUCKET

# Websocket Information
ARG NEXT_PUBLIC_WS_URL

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN SKIP_ENV_VALIDATION=1 npm run build

##### DEV CONTAINER

FROM node:18-alpine3.17 AS dev-container

WORKDIR /workspace/app

# Install git
RUN apk update && apk add git

ENV NEXT_TELEMETRY_DISABLED 1

# Use the --chown option to set file ownership to nextjs for both COPY commands
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "run", "dev"]

##### PRODUCTION

FROM node:18-alpine3.17 AS production

WORKDIR /app

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/emails ./emails

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]