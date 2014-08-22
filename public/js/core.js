angular.module('asteroids', [
  'ui.router'
])

.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'tmpl/partial-home.html',
      controller: 'homeCtrl'
    })
    .state('about', {
      url: '/about',
      templateUrl: 'tmpl/partial-about.html',
      controller: 'aboutCtrl'
    })
    .state('scores', {
      url: '/v1/high-scores',
      templateUrl: 'tmpl/partial-score.html',
      controller: 'scoreCtrl'
    })
    .state('game', {
      url: '/game',
      templateUrl: 'tmpl/partial-game.html',
      controller: 'gameCtrl'
    })
    .state('controls', {
      url: '/controls',
      templateUrl: 'tmpl/partial-controls.html',
      controller: 'gameCtrl'
    })

}])
