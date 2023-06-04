FROM node:18.15.0

ARG NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN if [ "$NODE_ENV" = "development" ]; then \
        npm install && npm install -g nodemon ; \
    else \
        npm install --only=production ; \
    fi

COPY . .

EXPOSE 5000

CMD if [ "$NODE_ENV" = "development" ]; then \
        nodemon bot/core/shard.js ; \
    else \
        node bot/core/shard.js ; \
    fi
