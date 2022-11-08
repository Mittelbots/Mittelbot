FROM node:alpine as build

ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /usr/app
COPY . /usr/app

# install dependencies
RUN ["npm", "i"]

# start the bot
ENTRYPOINT [ "npm", "run", "dev" ]

USER worker