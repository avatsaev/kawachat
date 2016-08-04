"use strict";

const _ = require("lodash");


let chat = {
  socket: null,
  users: [],
  rooms: [],
  current_state: 0,
};

//forward declatation becuase of circular dependencies
module.exports = chat;

const utils = require("./utils");
const User = require("./user");
const Room = require("./room");

//get room by frequency
chat.get_room = (frq) => {
  return _.find(chat.rooms, (r) => {
    return r.frq == frq;
  });
};

//add new room if doesn't exist
chat.add_room = (frq) => {

  let room = chat.get_room(frq);

  if(room == undefined){
    room = new Room(frq);
    chat.rooms.push(room);
  }

  return room;

};

chat.remove_room = (frq) => {
  _.remove(chat.rooms, (r) => {
    return r.frq == frq;
  });
};


//get user by socket id
chat.get_user = (client_id) => {
  return _.find(chat.users, u => {
    return u.client_id == client_id;
  });
};


chat.add_user = (data) => {

  let user_data = data;

  if (user_data["username"]==undefined || user_data["username"]=="") {
    user_data.username="User_"+Math.floor(Math.random()*110000);
  }

  if (user_data["frq"]==undefined || user_data["frq"]=="") {
    user_data.frq="1";
  }

  user_data.username = utils.escape_html(user_data["username"]).substring(0, 20);
  user_data.frq = utils.escape_html(user_data["frq"]).substring(0, 32);
  user_data.client_id = user_data.socket.id

  let user = new User(user_data);

  chat.users.push(user);

  return user;
};

chat.remove_user = (client_id) => {
  _.remove(chat.users, (u) => {
    return u.client_id == client_id;
  });
}

//check if there is a username on a frequency
chat.username_exists = (username, frq) =>{
  return _.filter(chat.users, (u) =>{
    return u.username == username && u.frq == frq;
  }).length;
}


//broadcast to all frequencies
chat.broadcast = (msg) => {
  chat.socket.sockets.emit("update", msg);
}


chat.status = () => {
  console.log("User count: ", chat.users.length);
  console.log("Room count: ", chat.rooms.length);
}


chat.as_json = () => {

  let json_data = {
    rooms: []
  }

  _.forEach(chat.rooms, (r) =>{
    json_data.rooms.push(r.as_json());
  });

  return json_data;

}

module.exports = chat;
