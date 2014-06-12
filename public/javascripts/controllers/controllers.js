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
    ]

    $scope.entity = "Players"
}

function Welcome($scope,$http,$cookies) {
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
    }
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
    }

    $scope.loadUser = function() {
        var curUser = $cookies.user;

        if ( curUser ) {
            $scope.user = JSON.parse(curUser);
        }
    }

    $scope.resetUser = function(){
        $scope.user = null;
    }
}