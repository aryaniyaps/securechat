# ---- Dependencies Stage ----
FROM elixir:1.14-alpine AS deps

WORKDIR /ws_server

# Install hex, rebar, and build dependencies
RUN mix local.hex --force && \
    mix local.rebar --force && \
    apk add --no-cache build-base

# Copy mix.exs and mix.lock to install dependencies
COPY mix.exs mix.lock ./

# Install dependencies
RUN mix deps.get

# ---- Development Stage ----
FROM deps AS dev

# This stage is used for development. 
# It builds upon the dependencies stage and includes source code.
COPY . .

CMD ["mix", "phx.server"]

# ---- Production Stage ----
FROM deps AS builder

# Set MIX_ENV to prod
ENV MIX_ENV=prod

# Install production dependencies and compile the ws_server
RUN mix deps.get --only prod && \
    mix compile

# Create the production release
COPY . .
RUN mix release

# ---- Final Stage ----
FROM alpine:3.14 AS final

WORKDIR /ws_server

# Install runtime dependencies for ERTS
RUN apk add --no-cache openssl ncurses-libs

# Copy over the built release from the builder stage
COPY --from=builder /ws_server/_build/prod/rel/ws_server ./

ENV HOME=/ws_server

CMD ["bin/ws_server", "start"]
