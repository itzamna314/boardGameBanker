bgbControllers.controller('NewGame',[
    '$scope',
    '$http',
    '$rootScope',
    '$location',
    function($scope,$http,$rootScope,$location){

        $scope.addPlayer = function(){
            $scope.players.push(PlayerFactory.newPlayer());
        };

        $scope.createGame = function(){
            $http.post('ajax/newgame',{title:$scope.title,players:$scope.players}).success(function(){
                $location.path('/games');
            });
        };

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

        // Constructor
        if ( !$rootScope.user || !$rootScope.user.email ){
            $location.path('/');
            return;
        }

        var selfPlayer = PlayerFactory.init().newPlayer();
        selfPlayer.email = $rootScope.user.email;
        selfPlayer.isCreator = true;
        var firstPlayer = PlayerFactory.newPlayer();
        $scope.players = [selfPlayer,firstPlayer];
    }
]);
