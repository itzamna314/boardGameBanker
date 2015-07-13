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
        };

        $scope.modifyTransaction = function(resourceId, amount){
            if ( $scope.currentPlayer.resources[resourceId].transaction === undefined )
                $scope.currentPlayer.resources[resourceId].transaction = 0;

            $scope.currentPlayer.resources[resourceId].transaction += amount;
        };

        $scope.commitTransaction = function(resId){
            $scope.currentPlayer.resources[resId].score +=
                $scope.currentPlayer.resources[resId].transaction;

            submitPoints();

            $scope.currentPlayer.resources[resId].transaction = 0;
        };

        $scope.cancelTransaction = function(resId){
            $scope.currentPlayer.resources[resId].transaction = 0;
        };

        $scope.carouselLeft = function()
        {
            $('#resource-carousel').carousel('next');
        };

        $scope.carouselRight = function()
        {
            $('#resource-carousel').carousel('prev');
        };

        $scope.setCurrentPlayer = function(player){
            if ( $scope.me.isCreator ) {
                $scope.currentPlayer = player;
            }
        };

        function getDetails(gameId){
            httpWrapper.get('ajax/gamedetail/' + gameId + '/' + $rootScope.user.id)
                .success(function (data) {
                    $scope.game = data.game;
                    $scope.players = data.players;
                    // Store resource descriptors as {id -> resourceObj}
                    $scope.playerResourceDefinitions = _.object(
                        _.pluck(data.playerResourceDefinition, 'id'),
                        data.playerResourceDefinition
                    );

                    // Add in button descriptors.  We will want to get these from the server eventually, as they
                    // will be configurable.
                    _.forEach($scope.playerResourceDefinitions, function(pr) {
                        pr.buttonsNegative = [1,5,10,50,100,1000];
                        pr.buttonsPositive = [1,5,10,50,100,1000];
                    });

                    _.forEach($scope.players,function(player){
                        player.textColor = '#000000';
                        if ( player.color != null && colorBrightness(player.color) < textColorCutoff )
                            player.textColor = '#FFFFFF';

                        // Store player resource values as {id -> scoreObj}
                        player.resources = _.object(_.pluck(player.resources, 'id'), player.resources);
                    });

                    $scope.me = $scope.currentPlayer = _.find(data.players,'isMe');
                })
                .error(function(data){
                    $rootScope.modalTitle = 'Failed to reach server!';
                    $rootScope.modalBody = 'The server is probably hibernating.  The scores will be refreshed ' +
                        'as soon as it wakes up';

                    $('#the-modal').modal();
                });
        }

        function submitPoints(userId){
            httpWrapper.post('ajax/gameaddpoints/' + $scope.game.id + '/' + $scope.currentPlayer.playerId, {
                resources: $scope.currentPlayer.resources
            })
            .success(function (data) {
                for ( var player in data.players ) {
                    if ( !data.players.hasOwnProperty(player) )
                        continue;

                    for ( var resource in player.resources ) {
                        if ( !player.resources.hasOwnProperty(resource) )
                            continue;

                        $scope.players[player].resources[resource] =
                            player.resources[resource];
                    }
                }
            });
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