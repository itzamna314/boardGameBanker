var bgbControllers = angular.module('bgbControllers',[
    'utilsModule',
    'ngCookies',
    'ngTouch'
    //'ngAnimate'
]);

var bgbApp = angular.module('bgbApp',[
    'ngCookies',
    'ngRoute',
    'ngTouch',
    'ngAnimate',
    'utilsModule',
    'bgbControllers'
]).run(['$rootScope',function($rootScope){

    $rootScope.$on('$locationChangeSuccess',function(evt,absNewUrl,absOldUrl){
        var anchorIdx = absOldUrl.indexOf('#');
        if ( anchorIdx > -1 ) {
            $rootScope.previousPath = absOldUrl.substring(anchorIdx+1);
        }
    });
}]);

bgbApp.config(['$routeProvider',
    function($routeProvider){
        $routeProvider.
            when('/games',{
                templateUrl:'assets/partials/listgames.html',
                controllers:'GamesList'
            })
            .when('/games/active/:id',{
                templateUrl:'assets/partials/activegame.html',
                controllers:'ActiveGame'
            })
            .when('/joingame',{
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
            .when('/', {
                templateUrl:'assets/partials/welcome.html',
                controllers:'Welcome'
            }).otherwise({
                redirectTo: '/'
            });
    }
]);