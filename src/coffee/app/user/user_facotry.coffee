app.factory 'User', [ () ->

  user =
    name: ""
    channel: ""

  user.generate = (data = {}) ->

    if data.username
      user.name = data.username
    else
      user.name = 'User_' + Math.floor(Math.random() * 110000)

    if data.channel
      user.channel = data.channel
    else
      user.channel = "1"

    return

  user.is_empty = ->
    user.name == "" or user.channel == ""


  user

]
