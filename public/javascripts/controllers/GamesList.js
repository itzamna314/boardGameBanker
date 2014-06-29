bgbControllers.controller('GamesList',[
    '$scope',
    '$http',
    '$rootScope',
    '$location',
    function($scope,$http,$rootScope,$location) {
        /************************ Public **********************************/
        $scope.gameDetail = function(id){
          $location.path('/games/active/' + id);
        };
        /************************ Constructor *****************************/
        if ( !$rootScope.user || !$rootScope.user.email || !$rootScope.user.id) {
            $location.path('/');
            return;
        }

        $http.get('ajax/games/' + $rootScope.user.id).success(function(data){
            $scope.games = data.games;
        });
    }
]);
