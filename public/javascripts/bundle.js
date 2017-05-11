var app;

app = angular.module('KC', ['ui.router', 'ui.bootstrap', 'ngTouch', 'ngDialog', 'ngAnimate', "ui.event", "ui.keypress"]);

app.controller('ChannelsCtrl.show', [
  '$scope', '$rootScope', '$stateParams', '$state', 'User', 'Socket', 'ngDialog', function($scope, $rootScope, $stateParams, $state, User, Socket, ngDialog) {
    if (User.is_empty()) {
      User.generate();
      User.channel = $stateParams.channel_id;
    }
    $scope.hostname = "-";
    Socket.emit("join", {
      username: User.name,
      frq: User.channel
    });
    $scope.$on("$destroy", function() {
      Socket.remove_listener('update');
      Socket.remove_listener('err');
      return Socket.remove_listener('chat');
    });
    $scope.append_msg = function(msg, user, me) {
      var add_class, n;
      add_class = '';
      if (me) {
        add_class = 'me-msg';
      }
      $("<li class='msg-container'><strong><span class='username-label'> " + user + " </span></strong>:  " + ($scope.escapeHtml(msg).substring(0, 512)) + " </li>").appendTo('#msgs').addClass(add_class);
      $('#msg').val('');
      n = $(document).height();
      return $('html, body').animate({
        scrollTop: n
      }, 50);
    };
    $scope.send_msg = function() {
      var msg, outData;
      msg = $('#msg').val();
      if (msg === '') {
        return;
      }
      $scope.append_msg(msg, User.name, true);
      outData = {
        'msg': msg,
        'frq': User.channel,
        'usr': User.name
      };
      return Socket.emit('send', outData);
    };
    $scope.escapeHtml = function(text) {
      return text.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    };
    Socket.on('update', function(msg) {
      return $('#msgs').append('<li class="system-msg">' + msg + '</li>');
    });
    Socket.on('chat', function(data) {
      if (data.sender !== User.name) {
        return $scope.append_msg(data.msg, data.sender);
      }
    });
    Socket.on('host', function(hostname) {
      return $scope.hostname = hostname;
    });
    return Socket.on('err', function(data) {
      var dialog;
      dialog = ngDialog.open({
        template: "<div class='dialog-contents'> <h2>Error</h2> <p>" + data.msg + "</p> </div>",
        plain: true
      });
      return dialog.closePromise.then(function(data) {
        Socket.remove_listener('update');
        Socket.remove_listener('err');
        Socket.remove_listener('chat');
        return $state.go("home");
      });
    });
  }
]);

app.controller('HomeCtrl', [
  '$scope', '$rootScope', '$stateParams', '$state', 'User', function($scope, $rootScope, $stateParams, $state, User) {
    return $scope.on_login = function() {
      if (!$scope.login || !$scope.login.username || !$scope.login.channel) {
        User.generate($scope.login);
      } else {
        User.name = $scope.login.username;
        User.channel = $scope.login.channel;
      }
      return $state.go("channel", {
        channel_id: User.channel
      });
    };
  }
]);

app.controller('MainCtrl', [function() {}]);

app.config([
  '$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('home', {
      url: '/home',
      controller: 'HomeCtrl',
      templateUrl: '/views/home/index.html'
    }).state('channel', {
      url: "/channels/:channel_id",
      controller: 'ChannelsCtrl.show',
      templateUrl: '/views/channels/show.html'
    });
    return $urlRouterProvider.otherwise('home');
  }
]);

app.factory('Socket', [
  '$rootScope', function($rootScope) {
    var socket;
    socket = io(document.location.origin + '/kawachat');
    return {
      on: function(eventName, callback) {
        return socket.on(eventName, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            return callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        return socket.emit(eventName, data, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            if (callback) {
              return callback.apply(socket, args);
            }
          });
        });
      },
      disconnect: function() {
        return socket.disconnect();
      },
      remove_listener: function(event) {
        return socket.removeListener(event);
      }
    };
  }
]);

app.factory('User', [
  function() {
    var user;
    user = {
      name: "",
      channel: ""
    };
    user.generate = function(data) {
      if (data == null) {
        data = {};
      }
      if (data.username) {
        user.name = data.username;
      } else {
        user.name = 'User_' + Math.floor(Math.random() * 110000);
      }
      if (data.channel) {
        user.channel = data.channel;
      } else {
        user.channel = "1";
      }
    };
    user.is_empty = function() {
      return user.name === "" || user.channel === "";
    };
    return user;
  }
]);
