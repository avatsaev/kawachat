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

  as_json(){

    return {
      username: this.username,
      frq: this.frq
    }

  }

}

module.exports = User;
