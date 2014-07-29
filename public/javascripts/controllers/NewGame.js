bgbControllers.controller('NewGame',[
    '$scope',
    '$rootScope',
    '$location',
    'httpWrapper',
    function($scope,$rootScope,$location,httpWrapper){
        var PlayerFactory, selfPlayer, firstPlayer, sections;

        $scope.addPlayer = function(){
            $scope.players.push(PlayerFactory.newPlayer());
        };

        $scope.createGame = function(){
            httpWrapper.post('ajax/newgame',{title:$scope.title,players:$scope.players}).success(function(){
                $location.path('/games');
            });
        };

        $scope.activate = function(section){
            var oldSwitch = $('#switch-' + $scope.newGameActive);
            var newSwitch = $('#switch-' + section);

            oldSwitch.removeClass('transition-switch-left transition-switch-right');

            if ( sections[section] > sections[$scope.newGameActive] )   // Moving right, transition left
            {
                oldSwitch.addClass('transition-switch-left');
                newSwitch.addClass('transition-switch-left');
            }
            else
            {
                oldSwitch.addClass('transition-switch-right');
                newSwitch.addClass('transition-switch-right');
            }

            $scope.newGameActive = section;
        };

        // Constructor
        if ( !$rootScope.user || !$rootScope.user.email ){
            $location.path('/');
            return;
        }

        PlayerFactory = (function(){
            var idx = 0;

            function Player(){
                this.email = null;
                this.idx = null;
                this.isCreator = null;
            }

            return {
                newPlayer:function(){
                    var player = new Player();
                    player.idx = idx;
                    idx++;
                    return player;
                },
                init:function(){
                    idx = 0;
                    return this;
                }
            }
        })();

        selfPlayer = PlayerFactory.init().newPlayer();
        selfPlayer.email = $rootScope.user.email;
        selfPlayer.isCreator = true;

        firstPlayer = PlayerFactory.newPlayer();
        $scope.players = [selfPlayer,firstPlayer];

        httpWrapper.timeout = 1000;
        $rootScope.isActive = 'NewGame';

        $scope.newGameActive = 'players';

        sections = {
            players:1,
            settings:2,
            resources:3
        };

        $('body').addClass('with-bottom-nav');
    }
]);
