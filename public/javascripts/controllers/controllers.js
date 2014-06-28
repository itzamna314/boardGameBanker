var bgbControllers = angular.module('bgbControllers',[
    'ngCookies'
]);

bgbControllers.controller('Welcome',[
    '$scope',
    '$http',
    '$cookies',
    '$rootScope',
    '$location',
    function($scope/*,$http,$cookies,$rootScope,$location*/) {
        /**************************** Public *********************************/
        $scope.findUser = function(query){
            $http.get('ajax/getuser/' + query).success(function(data){
                $rootScope.user = data;

                if ( data.found ) {
                    $cookies.user = JSON.stringify({
                        email:data.email,
                        username:data.username,
                        id:data.id
                    });

                    if ( $rootScope.token ) {
                        $location.path('/joingame');
                    }
                }
                else {
                    $cookies.user = JSON.stringify({});
                }
            });
        };

        $scope.createUser = function(username,email){
            $http.post('ajax/createuser',{name:username,email:email}).success(function(data){
                $scope.result = data;

                if ( !data.error ) {
                    $scope.user = {
                        email:email,
                        username:username,
                        id:data.id
                    };

                    $cookies.user = JSON.stringify($scope.user);
                }
                else {
                    $cookies.user = JSON.stringify({});
                }
            })
        };

        $scope.resetUser = function(){
            $scope.user = null;
            $cookies.user = JSON.stringify({});
        };

        $scope.loadUser = function () {
            /*var curUser = loadUser($cookies);

            if ( curUser && curUser.email )
                $scope.findUser(curUser.email);
            else
                $scope.user = null;*/
        };

        /*********************** Private ******************************/

        /************************* Constructor *************************/
        $scope.loadUser();
    }
]);

bgbControllers.controller('GamesList',[
    '$scope',
    '$http',
    '$rootScope',
    '$location',
    function($scope,$http,$rootScope,$location) {
        if ( !$rootScope.user || !$rootScope.user.email ) {
            $location.path('/');
            return;
        }

        $http.get('ajax/games/' + curUser.id).success(function(data){
            $scope.games = data.games;
        })
    }]
);

bgbControllers.controller('NewGame',[
    '$scope',
    '$http',
    '$rootScope',
    '$location',
    function($scope,$http,$rootScope,$location){

        $scope.addPlayer = function(){
            $scope.players.push(PlayerFactory.newPlayer());
        }

        $scope.createGame = function(){
            $http.post('ajax/newgame',{title:$scope.title,players:$scope.players}).success(function(data){
                $location.path('/games');
            });
        }

        // Constructor
        if ( !$rootScope.user || !$rootScope.user.email ){
            $location.path('/');
            return;
        }

        var selfPlayer = PlayerFactory.init().newPlayer();
        selfPlayer.email = curUser.email;
        selfPlayer.isCreator = true;
        var firstPlayer = PlayerFactory.newPlayer();
        $scope.players = [selfPlayer,firstPlayer];
    }
]);

bgbControllers.controller('JoinGame',[
    '$scope',
    '$http',
    '$rootScope',
    '$location',
    '$routeParams',
    function($scope,$http,$rootScope,$location,$routeParams){

        if ( $routeParams.token ) {
            $rootScope.token = $routeParams.token;
        }

        if ( !$rootScope.user || !$rootScope.user.email ) {
            $location.path('/');
            return;
        }

        doJoin();


        $scope.joinGame = function(){
            doJoin();
        }

        function doJoin() {
            if ( $rootScope.user && $scope.token ) {
                var joinToken = $rootScope.token;
                $rootScope.token = null;

                $http.post('ajax/joingame',{userId:$rootScope.user.id,token:joinToken}).success(function(data){
                    $location.path('/games');
                }).error(function(data){
                    $scope.errorMessage = "Invalid Token!";
                });
            }
        }
    }
]);

// Look up current user from cookies.
// Return user object if found in cookie, else null
function loadUser($cookies) {
    var curUser = $cookies.user;

    if ( curUser )
        return JSON.parse(curUser);

    return null;
}

var PlayerFactory = (function(){
    var idx = 0;

    function Player(){
        this.email = null;
        this.idx = null;
        this.isCreator = false;
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