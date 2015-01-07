angular.module('starter.controllers', [])

//首页控制器
.controller('HomeCtrl', function($scope) {

})

//我的挑战
.controller('MyBattlesCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

//荣誉榜
.controller('HonorCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

//其他设置
.controller('OtherCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})
