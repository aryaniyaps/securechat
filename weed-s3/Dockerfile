# Use the official centrifugo image as a base
FROM chrislusf/seaweedfs:3.55 AS production

ARG S3_ACCESS_KEY

ARG S3_SECRET_KEY

# Install gettext for envsubst
RUN apk add --no-cache gettext

COPY ./config.json /tmp/config.json.template

COPY ./entrypoint.sh /new-entrypoint.sh

RUN chmod +x /new-entrypoint.sh

ENTRYPOINT ["/new-entrypoint.sh"]