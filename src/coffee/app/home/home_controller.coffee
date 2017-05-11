
app.controller 'HomeCtrl', [
  '$scope'
  '$rootScope'
  '$stateParams'
  '$state'
  'User'

  ($scope, $rootScope, $stateParams, $state, User) ->


    $scope.on_login = ->

      if !$scope.login or !$scope.login.username or !$scope.login.channel
        User.generate($scope.login)
      else
        User.name = $scope.login.username
        User.channel = $scope.login.channel

      $state.go("channel", {channel_id: User.channel})



]
