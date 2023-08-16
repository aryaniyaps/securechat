#!/bin/bash

# Run the setup command provided by the base image to set up a mail account
# TODO: I think this user is not persisting as the volume isnt attached during the build stage
setup email add ${EMAIL_USERNAME} ${EMAIL_PASSWORD}

setup config dkim