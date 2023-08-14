# Use the official centrifugo image as a base
FROM centrifugo/centrifugo:v5 as dev-container

# Copy your Centrifugo Config into the image
COPY ./dev.centrifugo.json /centrifugo/config.json

# Set default command to run on container start
CMD ["centrifugo", "-c", "config.json"]


# Use the official centrifugo image as a base
FROM centrifugo/centrifugo:v5 as production

# Copy your Centrifugo Config into the image
COPY ./prod.centrifugo.json /centrifugo/config.json

# Set default command to run on container start
CMD ["centrifugo", "-c", "config.json"]
