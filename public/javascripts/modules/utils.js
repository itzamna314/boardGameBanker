/**
 * Created by Kyl on 7/17/2014.
 */

var utilsModule = angular.module('utilsModule',[]);

utilsModule.factory('httpWrapper', ['$http','$rootScope', function($http,$rootScope) {
    var _http = function(){};

    _http.prototype = $http.prototype;

    _http.get = function(uri){
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

    var hibernateModal = '\
                <div id="http-wrapper-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">\
                    <div class="modal-dialog">\
                        <div class="modal-content">\
                            <div class="modal-header">\
                                <button type="button" class="close" data-dismiss="modal"></button>\
                                <h4 class="modal-title">Server error!</h4>\
                            </div>\
                            <div class="modal-body">It looks like the server is currently hibernating.  Please\
                            try again in a minute or so.</div>\
                            <div class="modal-footer">\
                                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                            </div>\
                        </div>\
                    </div>\
                </div>';

    return _http;
}]);