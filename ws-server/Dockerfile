# ---- Dependencies Stage ----
FROM elixir:1.14-alpine AS deps

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
FROM deps AS dev-container

WORKDIR /workspace/ws-server

# Copy the dependencies fetched in the deps stage
COPY --from=deps /ws-server/deps deps

COPY . .

EXPOSE 4000

ENV PORT 4000

CMD ["mix", "phx.server"]

# ---- Production Build Stage ----
FROM deps AS builder

# Set MIX_ENV to prod
ENV MIX_ENV=prod

WORKDIR /ws-server

# Compile the application
COPY . .
RUN mix compile

# Create the production release
RUN mix release

# ---- Production Stage ----
FROM alpine:3.14 AS production

WORKDIR /ws-server

# Install runtime dependencies for ERTS and set up locale
RUN apk add --no-cache openssl ncurses-libs

RUN addgroup -S elixir && adduser -S -G elixir elixir

# Copy over the built release from the builder stage
COPY --from=builder --chown=elixir:elixir /ws-server/_build/prod/rel/ws_server ./

ENV HOME=/ws-server

USER elixir

EXPOSE 4000

ENV PORT 4000

CMD ["/ws-server/bin/ws_server", "start"]
