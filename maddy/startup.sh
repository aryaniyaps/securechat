#!/bin/sh

# Check if environment variables are set
if [ -n "$MADDY_USERNAME" ] && [ -n "$MADDY_PASSWORD" ]; then
    # Use maddy's built-in `maddyctl` to create or update user.
    maddy creds create $MADDY_USERNAME -p $MADDY_PASSWORD
fi

# Execute the main application
exec /bin/maddy -config /data/maddy.conf run
