var bgbApp = angular.module('bgbApp',['ngCookies']);

function GamesList($scope,$http,$cookies,$window) {

    var curUser = loadUser($cookies);
    if ( !curUser || !curUser.email ) {
        $window.location.href = '/';
        return;
    }

    $scope.user = curUser;

    $http.get('ajax/games/' + curUser.id).success(function(data){
        $scope.games = data.games;
    })
}

function Welcome($scope,$http,$cookies,$window) {

    /**************************** Public *********************************/
    $scope.findUser = function(query){
        $http.get('ajax/getuser/' + query).success(function(data){
            $scope.user = data;
            if ( data.found ) {

                $cookies.user = JSON.stringify({
                    email:data.email,
                    username:data.username,
                    id:data.id
                });

                if ( $cookies.token ) {
                    $window.location.href = '/joingame';
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
                }
                $cookies.user = $scope.user
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
        var curUser = loadUser($cookies);

        if ( curUser && curUser.email )
            $scope.findUser(curUser.email);
        else
            $scope.user = null;
    };

    /*********************** Private ******************************/

    /************************* Constructor *************************/
    $scope.loadUser();
}

function NewGame($scope,$http,$cookies,$window){

    $scope.addPlayer = function(){
        $scope.players.push(PlayerFactory.newPlayer());
    }

    $scope.createGame = function(){
        $http.post('ajax/newgame',{title:$scope.title,players:$scope.players}).success(function(data){
            $window.location.href = '/games';
        });
    }

    // Constructor
    var curUser = loadUser($cookies);
    if ( !curUser || !curUser.email ){
        $window.location.href = '/';
        return;
    }

    $scope.user = curUser;

    var selfPlayer = PlayerFactory.init().newPlayer();
    selfPlayer.email = curUser.email;
    selfPlayer.isCreator = true;
    var firstPlayer = PlayerFactory.newPlayer();
    $scope.players = [selfPlayer,firstPlayer];
}

function JoinGame($scope,$http,$cookies,$window){

    $scope.init = function( token ) {
        if ( token ) {
            $cookies.token = $scope.token = token;
        }
        else if ( $cookies.token ) {
            $scope.token = $cookies.token;
        }

        var curUser = loadUser($cookies);
        if ( !curUser || !curUser.email ) {
            $window.location.href = '/';
            return;
        }

        $scope.user = curUser;
        doJoin();
    }

    $scope.joinGame = function(){
        doJoin();
    }

    function doJoin() {
        if ( $scope.user && $scope.token ) {
            var joinToken = $scope.token;
            $scope.token = null;
            delete $cookies.token;

            $http.post('ajax/joingame',{userId:$scope.user.id,token:joinToken}).success(function(data){
                $window.location.href = '/games';
            }).error(function(data){
                $scope.errorMessage = "Invalid Token!";
            });
        }
    }
}

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