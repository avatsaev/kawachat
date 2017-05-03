"use strict";

const port = process.env.PORT || 3002;
const env = process.env.NODE_ENV || "development";
const redis_host = process.env.REDIS_HOST || "localhost";
const redis_port = process.env.REDIS_PORT || 6379;

const http = require('http');
const _ = require("lodash");
const os = require("os");

let chat  = require("./app/chat");
const utils = require("./app/utils");


// Send index.html to all requests
let app = http.createServer(function(req, res) {

  if(req.url === "/stats.json"){
    res.writeHead(200, {'Content-Type': 'application/json'});
    const response = chat.as_json();
    res.end(JSON.stringify(response));
  }else{
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("");
  }

});


// Socket.io server listens to our app

let socket = require('socket.io').listen(app);
let redis = require('socket.io-redis');

socket.adapter(redis({ host: redis_host, port: redis_port }));

socket.set( 'origins','*:*');

//set main socket
chat.socket = socket;

socket.on("connection", function (client) {

  console.log("incoming connection...");

  client.on("join", function(data){

    client.join(data.frq);
    socket.emit('update', (data.username+" has joined the server on the frequency "+data.frq) );
    socket.emit('host', os.hostname());

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

    socket.to(user.frq).emit('update', (user.username+" left the frequency "+user.frq) );
    chat.remove_user(client.id);

  });

});

console.log("---------- server running on port "+port+" -----------------")
app.listen(port);
