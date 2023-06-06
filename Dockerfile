FROM node:18.15.0

ARG NODE_ENV=production

WORKDIR /app

COPY . .

RUN if [ "$NODE_ENV" = "development" ]; then \
        npm install && npm install -g nodemon ; \
    else \
        npm install --omit-dev ; \
    fi

RUN chmod -R u=rwX,g=rX,o= ./node_modules

EXPOSE 5000

CMD if [ "$NODE_ENV" = "development" ]; then \
        nodemon bot/core/shard.js ; \
    else \
        node bot/core/shard.js ; \
    fi
