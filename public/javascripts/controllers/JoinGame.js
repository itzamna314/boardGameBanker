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
        };

        function doJoin() {
            if ( $rootScope.user && $scope.token ) {
                var joinToken = $rootScope.token || $scope.token;
                $rootScope.token = $scope.token = null;

                $http.post('ajax/joingame',{userId:$rootScope.user.id,token:joinToken}).success(function(){
                    $location.path('/games');
                }).error(function(data){
                    $scope.errorMessage = data.message;
                });
            }
        }
    }
]);