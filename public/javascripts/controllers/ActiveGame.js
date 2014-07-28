bgbControllers.controller('ActiveGame',[
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    'httpWrapper',
    function($scope,$rootScope,$location,$routeParams,httpWrapper) {
        $scope.refreshScore = function(){
            if ( $scope.game && $scope.game.id )
                getDetails($scope.game.id);

            if ( $scope.storedPoints ) {
                submitPoints($scope.storedPoints);
            }
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
            if ( numPoints != 0 ) {
                httpWrapper.post('ajax/gameaddpoints/' + $scope.game.id + '/' + $rootScope.user.id, {number: numPoints})
                    .success(function (data) {
                        $scope.storedPoints = 0;
                        $scope.game.myscore = _.find(data.players, 'isMe').score;
                        $scope.players = data.players;
                    });
            }
        }

        if ( !$rootScope.user ) {
            $location.path('/');
            return;
        }

        httpWrapper.timeout = 1000;
        $scope.currentTransaction = 0;
        $scope.displayMode = 'Scoreboard';
        $scope.storedPoints = 0;

        getDetails($routeParams.id);
    }
]);