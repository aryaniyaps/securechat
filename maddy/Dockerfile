FROM foxcpp/maddy:0.7

# Install OpenSSL for DKIM Key generation
RUN apk add --no-cache openssl

# Copy configuration file
COPY maddy.conf /data/maddy.conf

# Add a startup script
COPY startup.sh /usr/local/bin/startup.sh

# Make the script executable
RUN chmod +x /usr/local/bin/startup.sh

# Set the script as the entrypoint
ENTRYPOINT ["/usr/local/bin/startup.sh"]
