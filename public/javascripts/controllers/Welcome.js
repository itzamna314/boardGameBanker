bgbControllers.controller('Welcome',[
    '$scope',
    '$http',
    '$cookies',
    '$rootScope',
    '$location',
    function($scope,$http,$cookies,$rootScope,$location) {
        $rootScope.isActive = 'Welcome';

        /**************************** Public *********************************/
        $scope.findUser = function(query){
            $http.get('ajax/getuser/' + query).success(function(data){
                $rootScope.user = $scope.user = data;

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
            $http.post('ajax/createuser',{username:username,email:email}).success(function(data){
                $scope.result = data;

                if ( !data.error ) {
                    $scope.user = $rootScope.user = {
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
            $scope.user = $rootScope.user = null;
            $cookies.user = JSON.stringify({});
        };

        $scope.loadUser = function () {
            var curUser = loadUser($cookies);

            if ( curUser && curUser.id ) {
                curUser.found = true;
                $scope.user = $rootScope.user = curUser;
            }
            else
                $scope.user = $rootScope.user = null;
        };

        $scope.setUi = function(uiType){
            $rootScope.isA = uiType == 'A';
        };

        /*********************** Private ******************************/
            // Look up current user from cookies.
            // Return user object if found in cookie, else null
        function loadUser($cookies) {
            var curUser = $cookies.user;

            if ( curUser )
                return JSON.parse(curUser);

            return null;
        }

        /************************* Constructor *************************/
        if ( !$rootScope.user ) {
            $scope.loadUser();
            if ( $rootScope.user && $rootScope.previousPath != $location.path() ){
                $location.path($rootScope.previousPath);
            }
        }

        if ( !$scope.user ) {
            $scope.user = $rootScope.user;
        }

        if ( $rootScope.isA === undefined )
            $rootScope.isA = true;
    }
]);