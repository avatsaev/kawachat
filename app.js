"use strict";

const port = process.env.PORT || 3002;
const env = process.env.NODE_ENV || "development";

const http = require('http');
const _ = require("lodash");

let chat  = require("./app/chat");
const utils = require("./app/utils");
const tumbler = require("./app/tumbler");


// Send index.html to all requests
var app = http.createServer(function(req, res) {

  if(req.url == "/stats.json"){
    res.writeHead(200, {'Content-Type': 'application/json'});
    const response = chat.as_json();
    res.end(JSON.stringify(response));
  }else{
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("");
  }

});


// Socket.io server listens to our app
var socket = require('socket.io').listen(app);
socket.set( 'origins','*:*')

//set main socket
chat.socket = socket;

socket.on("connection", function (client) {

  console.log("incoming connection...");

  client.on("join", function(data){

    //send an error to front if user with the same username already exists on the frequency
    if(chat.username_exists(data.username, data.frq)){
      tumbler(null, "error", {client: client, errno: "EUSREXISTS", msg: "Username is taken"});
      return;
    }

    //assign a socket to the user
    data.socket = client;

    let user = chat.add_user(data);
    let room = chat.add_room(user.frq);

    //announce new user connection to all clients in the room
    tumbler(user.frq, "update", {msg: (user.username+" has joined the server on the frequency "+user.frq) });

    console.log(`User ${user.username} connected on frequency ${user.frq}`);

  });

  client.on("send", function(data){

    if(data["msg"]==undefined || data["msg"]=="" || data["frq"]==undefined || data["frq"]=="") return;

    //sanitize data
    data["frq"]= utils.escape_html(data["frq"]).substring(0, 32);
    data["msg"]= utils.escape_html(data["msg"]).substring(0, 512);
    data["usr"]= utils.escape_html(data["usr"]).substring(0, 64);

    let user = chat.get_user(client.id);

    tumbler(data["frq"], "chat",  {msg: data["msg"], usr: user });

  });

  client.on("disconnect", function(){

    let user = chat.get_user(client.id);

    if(user){

      console.log("User disconecting from frequency: ", user.frq);

      let room = user.get_room();

      tumbler(user.frq, "update", {
        msg: (`${user.username} left the frequency ${user.frq}`)
      });

      chat.remove_user(user.client_id);

      //if there is no more users left in the room, destroy it.
      if(room.people_count() == 0){
        chat.remove_room(room.frq);
      }

      chat.status();
    }

  });

});


console.log("---------- server running on port "+port+" -----------------")
app.listen(port);
