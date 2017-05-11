FROM node:7.10.0

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

EXPOSE 3003

RUN \
  apt-get update && \
  apt-get install -y ruby ruby-dev  && \
  rm -rf /var/lib/apt/lists/*

RUN npm install --global grunt bower
RUN gem install haml sass
RUN bower install --allow-root
RUN grunt build

CMD [ "npm", "start" ]