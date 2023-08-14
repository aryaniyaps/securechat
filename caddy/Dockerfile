# Build Caddy with the DigitalOcean DNS plugin
FROM caddy:2.7-builder-alpine AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/digitalocean


# Start from the base Caddy image
FROM caddy:2.7-alpine as dev-container

# Copy the custom-built Caddy binary
COPY --from=builder /usr/bin/caddy /usr/bin/caddy

# Copy your Caddyfile into the image
COPY ./dev.Caddyfile /etc/caddy/Caddyfile

# Start from the base Caddy image
FROM caddy:2.7-alpine as production

# Copy the custom-built Caddy binary
COPY --from=builder /usr/bin/caddy /usr/bin/caddy

# Copy your Caddyfile into the image
COPY ./Caddyfile /etc/caddy/Caddyfile
