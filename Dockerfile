
FROM node:14

WORKDIR /usr/src/app

ENV clientID= \
    clientSecret= \
    callBackURL= \
    admin= \
    token= \
    prefix= \
    port=

ADD src .

COPY package*.json ./

RUN npm install

EXPOSE 3000