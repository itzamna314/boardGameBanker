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
                {"name":"Ryan"},
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
                $cookies.username = data.name;
                //$cookies.user = {email:data.email,username:data.name};
            }
        });
    }
    $scope.createUser = function(username,email){
        $http.post('ajax/createuser',{name:username,email:email}).success(function(data){
            $scope.result = data;

            if ( data.status == 'success' ) {
                //$cookies.user = {email:email,username:username};
            }
        })
    }
    $scope.loadUser = function() {

    }
    $scope.resetUser = function(){
        $scope.user = null;
    }
}