FROM node:7.10.0-alpine

RUN mkdir -p /app

WORKDIR /app
COPY . /app

COPY .gemrc ~/

EXPOSE 3003

RUN apk update && apk upgrade && apk add --no-cache curl wget bash

# Install ruby and ruby-bundler
RUN apk add --no-cache ruby ruby-bundler

# Clean APK cache
RUN rm -rf /var/cache/apk/*

RUN gem install --no-rdoc --no-ri haml sass


RUN npm install \
 && npm install --global grunt bower \
 && bower install --allow-root\
 && grunt assets \
 && gem uninstall haml sass rdoc \
 && npm remove -g grunt bower \
 && npm cache clean \
 && apk del curl wget bash ruby ruby-bundler  \
 && rm -rf bower_components \
 && rm -rf .sass-cache

CMD [ "npm", "start" ]

# docker run -d -p 3002:3003 --network="kc" -e REDIS_HOST="172.18.0.2" kc
# docker run -d -p 3003:3003 --network="kc" -e REDIS_HOST="172.18.0.2" kc
# docker run -d -p 4000:80 --network="kc" -v /Users/avatsaev/DEV/Node/kawachat/nginx/default.conf:/etc/nginx/conf.d/default.conf nginx:1.13.0-alpine