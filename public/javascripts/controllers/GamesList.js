bgbControllers.controller('GamesList',[
    '$scope',
    '$http',
    '$rootScope',
    '$location',
    function($scope,$http,$rootScope,$location) {
        /************************ Public **********************************/
        $scope.gameDetail = function(gameId){
            $http.get('ajax/gamedetail/' + gameId).success(function(data){
                $location.path('/games/active/' + gameId);
            });
        };

        /************************ Constructor *****************************/
        if ( !$rootScope.user || !$rootScope.user.email || !$rootScope.user.id) {
            $location.path('/');
            return;
        }

        $http.get('ajax/games/' + $rootScope.user.id).success(function(data){
            $scope.games = data.games;
        });
    }]);
