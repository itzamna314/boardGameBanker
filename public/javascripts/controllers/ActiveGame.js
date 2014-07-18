bgbControllers.controller('ActiveGame',[
    '$scope',
    '$http',
    '$rootScope',
    '$location',
    '$routeParams',
    'httpWrapper',
    function($scope,$http,$rootScope,$location,$routeParams,httpWrapper) {
        $http.timeout = 1000;

        $scope.addPoints = function(numToAdd){
            $scope.game.myscore += numToAdd;

            submitPoints(numToAdd);
        };

        $scope.refreshScore = function(){
            if ( $scope.game && $scope.game.id )
                getDetails($scope.game.id);

            if ( $scope.storedPoints ) {
                submitPoints($scope.storedPoints);
            }
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
            httpWrapper.get('ajax/gamedetail/' + gameId + '/' + $rootScope.user.id)
                .success(function (data) {
                    $scope.game = data.game;
                    $scope.players = data.players;
                    var mePlayer = _.find(data.players,'isMe');
                    $scope.game.myscore = mePlayer.score;
                })
                .error(function(data){
                    $rootScope.modalTitle = 'Failed to reach server!';
                    $rootScope.modalBody = 'The server is probably hibernating.  The scores will be refreshed ' +
                        'as soon as it wakes up';

                    $('#the-modal').modal();
                });
        }

        function submitPoints(numPoints){
            $http.post('ajax/gameaddpoints/' + $scope.game.id + '/' + $rootScope.user.id,{number:numPoints})
                .success(function (data) {
                    $scope.storedPoints = 0;
                    $scope.game.myscore = _.find(data.players,'isMe').score;
                    $scope.players = data.players;
                })
                .error(function(data){
                    $rootScope.modalTitle = 'Failed to reach server!';
                    $rootScope.modalBody = 'The server is probably hibernating.  Your update has been saved, ' +
                        'and will be submitted as soon as the server wakes up.';

                    $('#the-modal').modal();

                    $scope.storedPoints += numPoints;
                });
        }

        if ( !$rootScope.user ){
            $location.path('/');
            return;
        }

        $scope.displayMode = 'Scoreboard';

        getDetails($routeParams.id);

        $scope.storedPoints = 0;
    }
]);