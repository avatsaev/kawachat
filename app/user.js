"use strict";
const _ = require("lodash");
let chat  = require("./chat");

class User {

  constructor({socket = null, client_id=null, username="", frq="1" } = {}){
    this.client_id = client_id;
    this.socket = socket;
    this.username  = username;
    this.frq = frq;
  }

  get_room(){
    // console.log("getting room with frq ", this.frq);
    // console.log("from ", chat.rooms);
    return  _.find(chat.rooms, (r) => { return r.frq == this.frq });
  }

  as_json(){

    return {
      username: this.username,
      frq: this.frq
    }

  }

}

module.exports = User
