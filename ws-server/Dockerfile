##### DEPENDENCIES

FROM node:18-alpine3.17 AS deps
RUN apk add --no-cache libc6-compat openssl1.1-compat
WORKDIR /ws-server

# Install dependencies based on the preferred package manager

COPY package.json package-lock.json* ./

RUN npm ci

##### BUILDER

FROM node:18-alpine3.17 AS builder

ARG CONNECT_PROXY_URL

WORKDIR /ws-server
COPY --from=deps /ws-server/node_modules ./node_modules
COPY . .

RUN SKIP_ENV_VALIDATION=1 npm run build
    
##### DEV CONTAINER

FROM node:18-alpine3.17 AS dev-container

WORKDIR /workspace/ws-server

# Use the --chown option to set file ownership to socketio for both COPY commands
COPY --from=deps /ws-server/node_modules ./node_modules
COPY . .

EXPOSE 5000
ENV PORT 5000

CMD ["npm", "run", "dev"]

##### PRODUCTION

FROM node:18-alpine3.17 AS production
WORKDIR /ws-server

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 socketio

# COPY --from=builder /ws-server/package.json ./package.json

COPY --from=builder /ws-server/package.json /ws-server/package-lock.json* ./

# Install production dependencies (as NODE_ENV is set to production)
RUN npm ci

COPY --from=builder --chown=socketio:nodejs /ws-server/build ./build

USER socketio
EXPOSE 5000
ENV PORT 5000

CMD ["npm", "run", "start"]