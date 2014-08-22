angular.module('asteroids')

.controller('homeCtrl', ['$scope', '$interval', function($scope, $interval) {
  $scope.title = 'Asteroids';
  $scope.display = true;

  $interval(function() {
    $scope.display = !$scope.display;
  }, 1000);


}]);
