# ---- Dependencies Stage ----
FROM hexpm/elixir:1.14.5-erlang-26.1.1-alpine-3.18.2 AS deps

WORKDIR /ws-server

# Install hex, rebar, and build dependencies
RUN mix local.hex --force && \
    mix local.rebar --force && \
    apk add --no-cache build-base git

# Copy mix.exs and mix.lock to install dependencies
COPY mix.exs mix.lock ./

# Install dependencies
RUN mix deps.get

# ---- Development Stage ----
FROM hexpm/elixir:1.14.5-erlang-26.1.1-alpine-3.18.2 AS dev-container

WORKDIR /workspace/ws-server

# Install hex, rebar, and necessary dependencies
RUN mix local.hex --force && \
    mix local.rebar --force && \
    apk add --no-cache build-base git

# Copy the dependencies fetched in the deps stage
COPY --from=deps /ws-server/deps deps

# Copy the current directory
COPY . .

EXPOSE 4000

ENV PORT 4000

CMD ["mix", "phx.server"]

# ---- Production Build Stage ----
FROM deps AS builder

# RabbitMQ Configuration
ARG RABBITMQ_URL
ARG RABBITMQ_QUEUE_NAME

# Connect Proxy Configuration
ARG TOKEN_VERIFY_URL

# Set MIX_ENV to prod
ENV MIX_ENV=prod

WORKDIR /ws-server

# Compile the application
COPY . .
RUN mix deps.get --only $MIX_ENV && mix compile

# Create the production release
RUN mix release

# ---- Production Stage ----
FROM alpine:3.18.2 AS production

# Install runtime dependencies for ERTS and set up locale
RUN apk upgrade --no-cache && \
    apk add --no-cache openssl ncurses-libs libstdc++ libgcc

ENV LANG=C.UTF-8

WORKDIR /ws-server

ENV HOME=/ws-server

RUN addgroup -S elixir && adduser -S -G elixir elixir

# Copy over the built release from the builder stage
COPY --from=builder --chown=elixir:elixir /ws-server/_build/prod/rel/ws_server ./

USER elixir

EXPOSE 4000

ENV PORT 4000

CMD ["/ws-server/bin/ws_server", "start"]

