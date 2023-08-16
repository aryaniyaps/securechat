# Start from the official docker-mailserver image
FROM ghcr.io/docker-mailserver/docker-mailserver:latest

# Declare environment variables for the email account
ARG EMAIL_USERNAME
ARG EMAIL_PASSWORD

# Add any custom configurations or overrides if you have them
# COPY my-config.conf /path/in/container/

# Use a shell script to automate setup
COPY setup-mailserver.sh /tmp/setup-mailserver.sh

RUN chmod +x /tmp/setup-mailserver.sh

# Run custom setup script
RUN /tmp/setup-mailserver.sh
