#!/bin/bash

# Run the setup command provided by the base image to set up a mail account
setup email add ${EMAIL_USERNAME} ${EMAIL_PASSWORD}

setup config dkim