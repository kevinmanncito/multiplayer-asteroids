angular.module('asteroids')

.controller('scoreCtrl', ['$scope', '$http', 'Scores', function($scope, $http, Scores) {
  $scope.title = 'High Scores';

  Scores.get().then(function (data) {
    console.log(data);
    $scope.scores = data;
  });



  $scope.save = function() {
    console.log($scope.score);
    $http.post('/v1/high-scores', $scope.score)
      .success(function(data) {
        $scope.scores = data;
      })
      .error(function(data) {
        console.log('error: ' + data);
      });
      $scope.score = '';
  };

  $scope.delete = function(index) {
    console.log('deleteing');
    $http.delete('/v1/high-scores/' + index)
      .success(function(data) {
        $scope.scores = data;
      })
      .error(function(data){
        console.log('error: ' + data);
      });
  };
  
}]);