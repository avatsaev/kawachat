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
 && grunt build \
 && gem uninstall haml sass rdoc \
 && npm remove -g grunt bower \
 && npm cache clean \
 && apk del curl wget bash ruby ruby-bundler  \
 && rm -rf bower_components \
 && rm -rf .sass-cache

CMD [ "npm", "start" ]