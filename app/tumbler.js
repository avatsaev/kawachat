"use strict";

let chat  = require("./chat");

function tumbler(frq, event, params){

  let room;

  if(frq){
    room = chat.get_room(frq);
  }


  if(event==="update"){
    room.system_msg(params.msg);
  }

  if(event==="chat"){
    room.send_msg(params.msg, params.usr);
  }

  if(event==="broadcast"){
    chat.broadcast(msg);
  }

  if (event==="error"){
    params.client.emit("err", {errno: params.errno, msg: params.msg})
  }

}

module.exports = tumbler;
