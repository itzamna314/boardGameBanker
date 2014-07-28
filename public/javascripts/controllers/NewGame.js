bgbControllers.controller('NewGame',[
    '$scope',
    '$rootScope',
    '$location',
    'httpWrapper',
    function($scope,$rootScope,$location,httpWrapper){
        $scope.addPlayer = function(){
            $scope.players.push(PlayerFactory.newPlayer());
        };

        $scope.createGame = function(){
            httpWrapper.post('ajax/newgame',{title:$scope.title,players:$scope.players}).success(function(){
                $location.path('/games');
            });
        };

        // Constructor
        if ( !$rootScope.user || !$rootScope.user.email ){
            $location.path('/');
            return;
        }

        var PlayerFactory = (function(){
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

        var selfPlayer = PlayerFactory.init().newPlayer();
        selfPlayer.email = $rootScope.user.email;
        selfPlayer.isCreator = true;
        var firstPlayer = PlayerFactory.newPlayer();
        $scope.players = [selfPlayer,firstPlayer];

        httpWrapper.timeout = 1000;
        $rootScope.isActive = 'NewGame';

        $scope.newGameActive = 'Players';

        $scope.icons = [
            {name:'asterisk',class:'glyphicon glyphicon-asterisk'},
            {name:'music',class:'glyphicon glyphicon-music'}
        ];

        $('body').addClass('with-bottom-nav');
    }
]);
