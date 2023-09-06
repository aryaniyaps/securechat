#!/bin/bash
# Substitute environment variables in config.json
envsubst < /tmp/config.json.template > /config.json
# Execute the original command
exec "$@"
