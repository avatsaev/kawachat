FROM node:7.10.0-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

EXPOSE 3003

RUN grunt assets

CMD [ "npm", "start" ]