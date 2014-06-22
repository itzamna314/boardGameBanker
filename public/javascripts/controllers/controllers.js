var bgbApp = angular.module('bgbApp',['ngCookies']);

function GamesList($scope) {
    $scope.games = [
        {
            "name":"Smallworld",
            "players":"test"/*{
                {"name":"Kim"},
                {"name":"Annie"},
                {"name":"Hannah"}
            }*/
        },
        {
            "name":"Game Of Thrones",
            "players":"another test"/*{
                {"name":"Alex"},
                {"name":"Mike"},
                {"name":"Ryan"}
            }*/
        }
    ];

    $scope.entity = "Players"
}

function Welcome($scope,$http,$cookies) {

    /**************************** Public *********************************/
    $scope.findUser = function(query){
        $http.get('ajax/getuser/' + query).success(function(data){
            $scope.user = data;
            if ( data.found ) {
                //$cookies.username = data.name;
                $cookies.user = JSON.stringify({
                    email:data.email,
                    username:data.name
                });
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
                $cookies.user = JSON.stringify({
                    email:email,
                    username:username
                });
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