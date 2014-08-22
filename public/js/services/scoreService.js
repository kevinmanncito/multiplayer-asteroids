angular.module('asteroids')

    .factory('Scores', ['$http', function($http) {
        return {
            get : function() {
                return $http.get('/v1/high-scores').then(function(response) {
                    return response.data;
                });
            },
            create : function(scoreData) {
                return $http.post('/v1/high-scores', scoreData);
            },
            delete : function(id) {
                return $http.delete('/v1/high-scores/' + id);
            }
        }
    }]);