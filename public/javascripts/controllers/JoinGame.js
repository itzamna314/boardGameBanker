bgbControllers.controller('JoinGame',[
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    'httpWrapper',
    function($scope,$rootScope,$location,$routeParams,httpWrapper){
        $scope.joinGame = function(){
            doJoin();
        };

        function doJoin() {
            if ( $rootScope.user && $scope.token ) {
                var joinToken = $rootScope.token || $scope.token;
                $rootScope.token = $scope.token = null;

                httpWrapper.post('ajax/joingame',{userId:$rootScope.user.id,token:joinToken}).success(function(){
                    $location.path('/games');
                }).error(function(data){
                    $scope.errorMessage = data.message;
                });
            }
        }

        if ( $routeParams.token ) {
            $rootScope.token = $routeParams.token;
        }

        if ( !$rootScope.user || !$rootScope.user.email ) {
            $location.path('/');
            return;
        }

        $rootScope.isActive = 'JoinGame';
        httpWrapper.timeout = 1000;

        doJoin();
    }
]);