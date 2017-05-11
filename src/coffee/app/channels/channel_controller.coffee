
app.controller 'ChannelsCtrl.show', [
  '$scope'
  '$rootScope'
  '$stateParams'
  '$state'
  'User'
  'Socket'
  'ngDialog'

  ($scope, $rootScope, $stateParams, $state, User, Socket, ngDialog) ->

    if User.is_empty()
      User.generate()
      User.channel = $stateParams.channel_id

    $scope.hostname = "-";

    Socket.emit "join",
      username: User.name
      frq: User.channel


    $scope.$on "$destroy", ->
      Socket.remove_listener('update')
      Socket.remove_listener('err')
      Socket.remove_listener('chat')



    $scope.append_msg = (msg, user, me) ->
      add_class = ''
      if me
        add_class = 'me-msg'

      $("<li class='msg-container'><strong><span class='username-label'> #{user} </span></strong>:  #{$scope.escapeHtml(msg).substring(0, 512)} </li>").appendTo('#msgs').addClass(add_class)

      $('#msg').val ''
      n = $(document).height()
      $('html, body').animate { scrollTop: n }, 50

    $scope.send_msg = ->
      msg = $('#msg').val()
      if msg == ''
        return

      $scope.append_msg msg, User.name, true
      outData =
        'msg': msg
        'frq': User.channel
        'usr': User.name
      Socket.emit 'send', outData

    $scope.escapeHtml = (text) ->
      text.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace /"/g, '&quot;'

    Socket.on 'update', (msg) ->
      $('#msgs').append '<li class="system-msg">' + msg + '</li>'


    Socket.on 'chat', (data) ->
      if(data.sender != User.name)
        $scope.append_msg data.msg, data.sender

    Socket.on 'host', (hostname) ->
      $scope.hostname = hostname

    Socket.on 'err', (data) ->

      dialog = ngDialog.open
        template: "
          <div class='dialog-contents'>
            <h2>Error</h2>
            <p>#{data.msg}</p>
          </div>
        ",
        plain: true

      dialog.closePromise.then  (data) ->
        Socket.remove_listener('update')
        Socket.remove_listener('err')
        Socket.remove_listener('chat')
        $state.go "home"

]
