var bgbApp = angular.module('bgbApp',[
    'ngCookies',
    'ngRoute',
    'bgbControllers'
]);

bgbApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl:'assets/partials/welcome.html',
                controllers:'Welcome'
            }).
            when('/games',{
                templateUrl:'assets/partials/listgames.html',
                controllers:'GamesList'
            })
            .when('/joingame/',{
                            templateUrl:'assets/partials/joingame.html',
                            controllers:'JoinGame'
                        })
            .when('/joingame/:token',{
                templateUrl:'assets/partials/joingame.html',
                controllers:'JoinGame'
            })
            .when('/newgame',{
                templateUrl:'assets/partials/newgame.html',
                controllers:'NewGame'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
]);