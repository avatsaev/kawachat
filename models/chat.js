"use strict";

const _ = require("lodash");


let chat = {
  socket: null,
  users: [],
  current_state: 0,
};

//forward declatation becuase of circular dependencies
module.exports = chat;

const utils = require("./utils");
const User = require("./user");

//get user by socket id
chat.get_user = (client_id) => {
  return _.find(chat.users, u => {
    return u.client_id === client_id;
  });
};

chat.add_user = (data) => {

  let user_data = data;

  if (!user_data["username"] || !user_data["username"]) {
    user_data.username="User_"+Math.floor(Math.random()*110000);
  }

  if (!user_data["frq"] || !user_data["frq"]) {
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
    return u.client_id === client_id;
  });
};

//check if there is a username on a frequency
chat.username_exists = (username, frq) =>{
  return _.filter(chat.users, (u) =>{
    return u.username === username && u.frq === frq;
  }).length;
};





chat.as_json = () => {

  let json_data = {
    rooms: []
  };

  _.forEach(chat.rooms, (r) =>{
    json_data.rooms.push(r.as_json());
  });

  return json_data;

};

module.exports = chat;
