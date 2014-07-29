bgbControllers.controller('ActiveGame',[
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    'httpWrapper',
    function($scope,$rootScope,$location,$routeParams,httpWrapper) {
        // If normalized background color intensity ([0,1]) < textColorCutoff,
        // set text color to white instead of black.
        var textColorCutoff = 0.3;

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

                    _.each($scope.players,function(player){
                        player.textColor = '#000000';
                        if ( colorBrightness(player.color) < textColorCutoff )
                            player.textColor = '#FFFFFF';
                    });
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

        function colorBrightness(colorString)
        {
            if ( colorString[0] == '#' )
                colorString = colorString.substr(1);

            var r = parseInt(colorString.substr(0,2),16);
            var g = parseInt(colorString.substr(2,2),16);
            var b = parseInt(colorString.substr(4,2),16);

            return (r + (g * 2) + b) / (255 * 3);
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