bgbControllers.controller('ActiveGame',[
    '$scope',
    '$http',
    '$rootScope',
    '$location',
    '$routeParams',
    function($scope,$http,$rootScope,$location,$routeParams) {

        $scope.addPoints = function(numToAdd){
            $http.post('ajax/gameaddpoints/' + $scope.game.id + '/' + $rootScope.user.id,{number:numToAdd})
                .success(function (data) {
                    $scope.game.myscore = data.game.myscore;
                    $scope.players = data.players;
            });
        };

        $scope.refreshScore = function(){
            if ( $scope.game && $scope.game.id )
                getDetails($scope.game.id);
        };

        function getDetails(gameId){
            $http.get('ajax/gamedetail/' + gameId + '/' + $rootScope.user.id).success(function (data) {
                $scope.game = data.game;
                $scope.players = data.players;
            });
        }

        if ( !$rootScope.user ){
            $location.path('/');
            return;
        }

        getDetails($routeParams.id);
    }
]);