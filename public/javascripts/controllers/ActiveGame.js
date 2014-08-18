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
            if ( $scope.myResources[resourceId].transaction === undefined )
                $scope.myResources[resourceId].transaction = 0;

            $scope.myResources[resourceId].transaction += amount;
        };

        $scope.commitTransaction = function(resId){
            $scope.myResources[resId].score +=
                $scope.myResources[resId].transaction;

            submitPoints();

            $scope.myResources[resId].transaction = 0;
        };

        $scope.carouselLeft = function()
        {
            $('#resource-carousel').carousel('next');
        };

        $scope.carouselRight = function()
        {
            $('#resource-carousel').carousel('prev');
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

                    var mePlayer = _.find(data.players,'isMe');
                    $scope.myResources = mePlayer.resources;
                })
                .error(function(data){
                    $rootScope.modalTitle = 'Failed to reach server!';
                    $rootScope.modalBody = 'The server is probably hibernating.  The scores will be refreshed ' +
                        'as soon as it wakes up';

                    $('#the-modal').modal();
                });
        }

        function submitPoints(){
            httpWrapper.post('ajax/gameaddpoints/' + $scope.game.id + '/' + $rootScope.user.id, {
                resources: $scope.myResources
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