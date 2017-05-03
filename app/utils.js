"use strict";
module.exports = {

  escape_html: function(text) {

    if(!text){
      return;
    }

    return text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

}
