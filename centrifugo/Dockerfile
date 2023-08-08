# Use the official centrifugo image as a base
FROM centrifugo/centrifugo:v5

# Copy your Centrifugo Config into the image
COPY ./centrifugo.json /centrifugo/config.json

# Set default command to run on container start
CMD ["centrifugo", "-c", "config.json"]
