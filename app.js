"use strict";

const port = process.env.PORT || 3003;
const env = process.env.NODE_ENV || "development";
const redis_host = process.env.REDIS_HOST || "redis";
const redis_port = process.env.REDIS_PORT || 6379;

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const redis = require('socket.io-redis');
const app = module.exports = express();
const _ = require("lodash");
const os = require("os");

let chat  = require("./models/chat");
const utils = require("./models/utils");

app.set('port', port);
app.set('env', env);

const server = app.listen(app.get('port'), () => {
  console.log('Kawachat server listening on port ' + app.get('port'));
});

const io_s = require('socket.io')(server);

io_s.set({'transports': ['websocket', 'polling']});


io_s.adapter(redis({
  host: redis_host,
  port: redis_port
}));

const socket = io_s.of('kawachat');

// Socket.io server listens to our app

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static(path.join(__dirname, 'public')));

if (app.get('env') === 'development') {
  app.use((error, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', err);
});

app.get('/', (req, res) => {
  res.render('index');
});

//set main socket
chat.socket = socket;

socket.on("connection", function (client) {

  console.log("incoming connection...");

  client.on("join", function(data){

    client.join(data.frq);
    socket.emit('update', (data.username+" has joined the server on the frequency "+data.frq) );
    client.emit('host', os.hostname());
    data.socket = client;
    chat.add_user(data);

  });

  client.on("send", function(data){

    if(!data["msg"] || data["msg"]==="" || !data["frq"] || data["frq"]==="") return;

    //sanitize data
    data["frq"]= utils.escape_html(data["frq"]).substring(0, 32);
    data["msg"]= utils.escape_html(data["msg"]).substring(0, 512);
    data["sender"]= utils.escape_html(data["usr"]).substring(0, 64);

    socket.to(data.frq).emit('chat', data);

  });

  client.on("disconnect", function(){

    let user = chat.get_user(client.id);

    if(user){
      socket.to(user.frq).emit('update', (user.username+" left the frequency "+user.frq) );
      chat.remove_user(client.id);
    }

  });

});
