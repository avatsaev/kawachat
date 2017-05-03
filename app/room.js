"use strict";
const _ = require("lodash");
let chat  = require("./chat");

class Room {

  constructor(frq){
    this.frq = frq;
  }

  people_count(){
    return this.people().length;
  }

  //users of the room
  people(){
    return _.filter(chat.users, (u) => {
      return u.frq === this.frq
    });
  }

  system_msg(msg){
    _.forEach(this.people(), (u) =>{
      u.socket.emit("update", msg);
    });
  }

  send_msg(msg, sender){

    console.log(`${sender.username} [${sender.frq}]: ${msg} `);

    _.forEach(this.people(), (u) => {

      if (u.client_id !== sender.client_id){
        u.socket.emit("chat", {msg, sender: sender.username});
      }

    });
  }

  as_json(){
    let json_data = {
      frq: this.frq,
      users: []
    };

    _.forEach(this.people(), (u) =>{
      json_data.users.push(u.as_json());
    });

    return json_data;

  }

}

module.exports = Room;
