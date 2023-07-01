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

RUN npm run build

# STAGE 3: Production

FROM node:lts-alpine as production

WORKDIR /app

# Environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=build /app/next.config.js ./
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma/

RUN npm ci --only=production

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
