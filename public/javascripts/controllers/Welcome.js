bgbControllers.controller('Welcome',[
    '$scope',
    '$cookies',
    '$rootScope',
    '$location',
    '$localStorage',
    'httpWrapper',
    function($scope,$cookies,$rootScope,$location,$localStorage,httpWrapper) {
        /**************************** Public *********************************/
        $scope.findUser = function(query){
            httpWrapper.get('ajax/getuser/' + query).success(function(data){
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

                    $scope.$storage.usersMru.add(query);
                }
                else {
                    $cookies.user = JSON.stringify({});
                    $scope.email = query;
                }
            });
        };

        $scope.createUser = function(username,email){
            httpWrapper.post('ajax/createuser',{username:username,email:email}).success(function(data){
                $scope.result = data;

                if ( !data.error ) {
                    $scope.user = $rootScope.user = {
                        email:email,
                        username:username,
                        id:data.id,
                        found:true
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

        $rootScope.isActive = 'Welcome';
        httpWrapper.timeout = 1000;

        /*$scope.$storage = $localStorage;

        if ( !$scope.$storage.usersMru )
            $scope.$storage.usersMru = [];*/
    }
]);