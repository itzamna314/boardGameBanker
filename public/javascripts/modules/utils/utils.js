/**
 * Created by Kyl on 7/17/2014.
 */

var utilsModule = angular.module('utilsModule',[]);
utilsModule.factory('httpWrapper', ['$http','$rootScope', function($http,$rootScope) {
    var _http = function(){};

    _http.prototype = $http;

    var $httpChild = new _http();

    $httpChild.get = function(uri){
        var _successCb = null;
        var _errorCb = null;
        var _response = null;

        $rootScope.isLoading = true;

        $http({method :'get',url:uri}).success(function(data)
        {
            $rootScope.isLoading = false;

            if ( _successCb )
                _successCb(data);
            else
                _response = data;
        }).error(function(data)
        {
            if ( !_errorCb || !_errorCb(data) ){
                _response = data;

                $rootScope.isLoading = false;

                var domModal = $('#http-wrapper-modal');

                if (domModal.length == 0)
                    domModal = $('body').append(hibernateModal).find('#http-wrapper-modal');

                domModal.modal();
            }
        });

        var retObj = {
            success: function (successCb) {
                if (_response)
                    successCb(_response);
                else
                    _successCb = successCb;

                return retObj;
            },
            error: function (errorCb) {
                if (_response)
                    errorCb(_response);
                else
                    _errorCb = errorCb;

                return retObj;
            }
        };

        return retObj;
    };

    return $httpChild;
}]);

utilsModule.directive('utilsModal', function() {
    return {
        restrict:'E',
        templateUrl: 'assets/javascripts/modules/utils/modal.html'
    };
});

utilsModule.directive('utilsLoading', function() {
    return {
        restrict:'E',
        templateUrl:'assets/javascripts/modules/utils/loadingbar.html'
    };
});