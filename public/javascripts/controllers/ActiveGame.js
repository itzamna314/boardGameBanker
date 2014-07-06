bgbControllers.controller('ActiveGame',[
    '$scope',
    '$http',
    '$rootScope',
    '$location',
    '$routeParams',
    function($scope,$http,$rootScope,$location,$routeParams) {

        $scope.addPoints = function(numToAdd){
            $scope.game.myscore += numToAdd;

            submitPoints(numToAdd);
        };

        $scope.refreshScore = function(){
            if ( $scope.game && $scope.game.id )
                getDetails($scope.game.id);
        };

        $scope.showScoreboard = function($event){
            if ( $event )
                $event.stopPropagation();

            $scope.displayMode = 'Scoreboard';
        };

        $scope.showTransaction = function($event){
            if ( $event )
                $event.stopPropagation();

            $scope.displayMode = 'Transaction';
            $scope.currentTransaction = 0;
        };

        $scope.showLogs = function(){
            $scope.displayMode = 'Logs';
        };

        $scope.modifyTransaction = function(amount){
            $scope.currentTransaction += amount;
        };

        $scope.commitTransaction = function(){
            $scope.game.myscore += $scope.currentTransaction;

            submitPoints($scope.currentTransaction);
            $scope.currentTransaction = 0;
            $scope.displayMode = 'Scoreboard';
        };

        function getDetails(gameId){
            $http.get('ajax/gamedetail/' + gameId + '/' + $rootScope.user.id).success(function (data) {
                $scope.game = data.game;
                $scope.players = data.players;
            });
        }

        function submitPoints(numPoints){
            $http.post('ajax/gameaddpoints/' + $scope.game.id + '/' + $rootScope.user.id,{number:numPoints})
                .success(function (data) {
                    $scope.game.myscore = data.game.myscore;
                    $scope.players = data.players;
                });
        }

        if ( !$rootScope.user ){
            $location.path('/');
            return;
        }

        $scope.displayMode = 'Scoreboard';

        getDetails($routeParams.id);
    }
]);