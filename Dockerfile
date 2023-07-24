# STAGE 1: Development

FROM node:lts-alpine as development

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# STAGE 2: Build

FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

ENV SKIP_ENV_VALIDATION 1

RUN npm run build

# STAGE 3: Production

FROM node:lts-alpine as production

WORKDIR /app

# Environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_ENV_VALIDATION 1

COPY --from=build /app/next.config.mjs ./
COPY --from=build /app/package*.json ./
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma/

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static


EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
