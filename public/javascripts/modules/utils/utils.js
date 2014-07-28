/**
 * Created by Kyl on 7/17/2014.
 */

var utilsModule = angular.module('utilsModule',[]);

utilsModule.factory('httpWrapper', ['$http','$rootScope', function($http,$rootScope) {
    //var _http = function(){};
    //_http.prototype = $http.prototype;

    var _http = Object.create($http);
    _http.baseGet = _http.get;
    _http.basePost = _http.post;

    _http.get = function (uri) {
        var _successCb = null;
        var _errorCb = null;
        var _response = null;

        $rootScope.isLoading = true;

        this.baseGet(uri).success(function (data) {
            $rootScope.isLoading = false;

            if (_successCb)
                _successCb(data);
            else
                _response = data;
        }).error(function (data) {
            if (!_errorCb || !_errorCb(data)) {
                _response = data;

                $rootScope.isLoading = false;

                var domModal = $('#http-wrapper-modal');
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

    _http.post = function(uri,postData){
        var _successCb = null;
        var _errorCb = null;
        var _response = null;

        $rootScope.isLoading = true;

        this.basePost(uri,postData).success(function(data)
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

    return _http;
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

utilsModule.directive('utilsMiniColor',function() {

    function link(scope,element,attrs,ngModel) {
        var miniColors = $(element).find('.mini-colors');

        scope.$watch(function(){
            return ngModel.$modelValue;
        }, function(modelValue){
            if ( miniColors && miniColors.value )
                miniColors.value(modelValue);
        });



        miniColors.minicolors({
            theme:'bootstrap',
            change: function(hex){
                scope.$apply(function(){
                   ngModel.$setViewValue(hex,'change');
                });
            }
        });
    }

    return {
        restrict:'E',
        require:'ngModel',
        link:link,
        templateUrl:'assets/javascripts/modules/utils/minicolors.html'
    }
});

utilsModule.directive('utilsIconSelect',function() {

    function link(scope,element,attrs,ngModel)
    {
        scope.icons = icons;

        var button = $(element).find('.icon-dropdown-btn');
        var items;

        function selectIcon(iconClass)
        {
            if ( iconClass ) {
                button.children('.no-selection').hide();
                button.children('.selected-icon')
                    .attr('class','selected-icon')
                    .addClass(iconClass);
            }
            else{
                button.children('.no-selection').show();
                button.children('.selected-icon').attr('class','selected-icon');
            }
        }

        scope.$watch(function(){
            return ngModel.$modelValue;
        }, function(modelValue){
            if ( modelValue && modelValue.class )
                selectIcon(modelValue.class);
        });

        element.find('.query-icons').click(function(){return false;});

        button.click(function()
        {
            if ( !items ) {
                items = $(element).find('.icon-dropdown-item');

                items.click(function()
                {
                    var $this = $(this);
                    selectIcon($this.attr('data-class'));
                });
            }
        });
    }

    return {
        restrict:'E',
        require:'ngModel',
        link:link,
        templateUrl:'assets/javascripts/modules/utils/selecticon.html'
    }
});

// Just make this global to save memory
var icons = [
    {name:'asterisk', class:'glyphicon glyphicon-asterisk'},
    {name:'plus', class:'glyphicon glyphicon-plus'},
    {name:'euro', class:'glyphicon glyphicon-euro'},
    {name:'minus', class:'glyphicon glyphicon-minus'},
    {name:'cloud', class:'glyphicon glyphicon-cloud'},
    {name:'envelope', class:'glyphicon glyphicon-envelope'},
    {name:'pencil', class:'glyphicon glyphicon-pencil'},
    {name:'glass', class:'glyphicon glyphicon-glass'},
    {name:'music', class:'glyphicon glyphicon-music'},
    {name:'search', class:'glyphicon glyphicon-search'},
    {name:'heart', class:'glyphicon glyphicon-heart'},
    {name:'star', class:'glyphicon glyphicon-star'},
    {name:'star-empty', class:'glyphicon glyphicon-star-empty'},
    {name:'user', class:'glyphicon glyphicon-user'},
    {name:'film', class:'glyphicon glyphicon-film'},
    {name:'th-large', class:'glyphicon glyphicon-th-large'},
    {name:'th', class:'glyphicon glyphicon-th'},
    {name:'th-list', class:'glyphicon glyphicon-th-list'},
    {name:'ok', class:'glyphicon glyphicon-ok'},
    {name:'remove', class:'glyphicon glyphicon-remove'},
    {name:'zoom-in', class:'glyphicon glyphicon-zoom-in'},
    {name:'zoom-out', class:'glyphicon glyphicon-zoom-out'},
    {name:'off', class:'glyphicon glyphicon-off'},
    {name:'signal', class:'glyphicon glyphicon-signal'},
    {name:'cog', class:'glyphicon glyphicon-cog'},
    {name:'trash', class:'glyphicon glyphicon-trash'},
    {name:'home', class:'glyphicon glyphicon-home'},
    {name:'file', class:'glyphicon glyphicon-file'},
    {name:'time', class:'glyphicon glyphicon-time'},
    {name:'road', class:'glyphicon glyphicon-road'},
    {name:'download-alt', class:'glyphicon glyphicon-download-alt'},
    {name:'download', class:'glyphicon glyphicon-download'},
    {name:'upload', class:'glyphicon glyphicon-upload'},
    {name:'inbox', class:'glyphicon glyphicon-inbox'},
    {name:'play-circle', class:'glyphicon glyphicon-play-circle'},
    {name:'repeat', class:'glyphicon glyphicon-repeat'},
    {name:'refresh', class:'glyphicon glyphicon-refresh'},
    {name:'list-alt', class:'glyphicon glyphicon-list-alt'},
    {name:'lock', class:'glyphicon glyphicon-lock'},
    {name:'flag', class:'glyphicon glyphicon-flag'},
    {name:'headphones', class:'glyphicon glyphicon-headphones'},
    {name:'volume-off', class:'glyphicon glyphicon-volume-off'},
    {name:'volume-down', class:'glyphicon glyphicon-volume-down'},
    {name:'volume-up', class:'glyphicon glyphicon-volume-up'},
    {name:'qrcode', class:'glyphicon glyphicon-qrcode'},
    {name:'barcode', class:'glyphicon glyphicon-barcode'},
    {name:'tag', class:'glyphicon glyphicon-tag'},
    {name:'tags', class:'glyphicon glyphicon-tags'},
    {name:'book', class:'glyphicon glyphicon-book'},
    {name:'bookmark', class:'glyphicon glyphicon-bookmark'},
    {name:'print', class:'glyphicon glyphicon-print'},
    {name:'camera', class:'glyphicon glyphicon-camera'},
    {name:'font', class:'glyphicon glyphicon-font'},
    {name:'bold', class:'glyphicon glyphicon-bold'},
    {name:'italic', class:'glyphicon glyphicon-italic'},
    {name:'text-height', class:'glyphicon glyphicon-text-height'},
    {name:'text-width', class:'glyphicon glyphicon-text-width'},
    {name:'align-left', class:'glyphicon glyphicon-align-left'},
    {name:'align-center', class:'glyphicon glyphicon-align-center'},
    {name:'align-right', class:'glyphicon glyphicon-align-right'},
    {name:'align-justify', class:'glyphicon glyphicon-align-justify'},
    {name:'list', class:'glyphicon glyphicon-list'},
    {name:'indent-left', class:'glyphicon glyphicon-indent-left'},
    {name:'indent-right', class:'glyphicon glyphicon-indent-right'},
    {name:'facetime-video', class:'glyphicon glyphicon-facetime-video'},
    {name:'picture', class:'glyphicon glyphicon-picture'},
    {name:'map-marker', class:'glyphicon glyphicon-map-marker'},
    {name:'adjust', class:'glyphicon glyphicon-adjust'},
    {name:'tint', class:'glyphicon glyphicon-tint'},
    {name:'edit', class:'glyphicon glyphicon-edit'},
    {name:'share', class:'glyphicon glyphicon-share'},
    {name:'check', class:'glyphicon glyphicon-check'},
    {name:'move', class:'glyphicon glyphicon-move'},
    {name:'step-backward', class:'glyphicon glyphicon-step-backward'},
    {name:'fast-backward', class:'glyphicon glyphicon-fast-backward'},
    {name:'backward', class:'glyphicon glyphicon-backward'},
    {name:'play', class:'glyphicon glyphicon-play'},
    {name:'pause', class:'glyphicon glyphicon-pause'},
    {name:'stop', class:'glyphicon glyphicon-stop'},
    {name:'forward', class:'glyphicon glyphicon-forward'},
    {name:'fast-forward', class:'glyphicon glyphicon-fast-forward'},
    {name:'step-forward', class:'glyphicon glyphicon-step-forward'},
    {name:'eject', class:'glyphicon glyphicon-eject'},
    {name:'chevron-left', class:'glyphicon glyphicon-chevron-left'},
    {name:'chevron-right', class:'glyphicon glyphicon-chevron-right'},
    {name:'plus-sign', class:'glyphicon glyphicon-plus-sign'},
    {name:'minus-sign', class:'glyphicon glyphicon-minus-sign'},
    {name:'remove-sign', class:'glyphicon glyphicon-remove-sign'},
    {name:'ok-sign', class:'glyphicon glyphicon-ok-sign'},
    {name:'question-sign', class:'glyphicon glyphicon-question-sign'},
    {name:'info-sign', class:'glyphicon glyphicon-info-sign'},
    {name:'screenshot', class:'glyphicon glyphicon-screenshot'},
    {name:'remove-circle', class:'glyphicon glyphicon-remove-circle'},
    {name:'ok-circle', class:'glyphicon glyphicon-ok-circle'},
    {name:'ban-circle', class:'glyphicon glyphicon-ban-circle'},
    {name:'arrow-left', class:'glyphicon glyphicon-arrow-left'},
    {name:'arrow-right', class:'glyphicon glyphicon-arrow-right'},
    {name:'arrow-up', class:'glyphicon glyphicon-arrow-up'},
    {name:'arrow-down', class:'glyphicon glyphicon-arrow-down'},
    {name:'share-alt', class:'glyphicon glyphicon-share-alt'},
    {name:'resize-full', class:'glyphicon glyphicon-resize-full'},
    {name:'resize-small', class:'glyphicon glyphicon-resize-small'},
    {name:'exclamation-sign', class:'glyphicon glyphicon-exclamation-sign'},
    {name:'gift', class:'glyphicon glyphicon-gift'},
    {name:'leaf', class:'glyphicon glyphicon-leaf'},
    {name:'fire', class:'glyphicon glyphicon-fire'},
    {name:'eye-open', class:'glyphicon glyphicon-eye-open'},
    {name:'eye-close', class:'glyphicon glyphicon-eye-close'},
    {name:'warning-sign', class:'glyphicon glyphicon-warning-sign'},
    {name:'plane', class:'glyphicon glyphicon-plane'},
    {name:'calendar', class:'glyphicon glyphicon-calendar'},
    {name:'random', class:'glyphicon glyphicon-random'},
    {name:'comment', class:'glyphicon glyphicon-comment'},
    {name:'magnet', class:'glyphicon glyphicon-magnet'},
    {name:'chevron-up', class:'glyphicon glyphicon-chevron-up'},
    {name:'chevron-down', class:'glyphicon glyphicon-chevron-down'},
    {name:'retweet', class:'glyphicon glyphicon-retweet'},
    {name:'shopping-cart', class:'glyphicon glyphicon-shopping-cart'},
    {name:'folder-close', class:'glyphicon glyphicon-folder-close'},
    {name:'folder-open', class:'glyphicon glyphicon-folder-open'},
    {name:'resize-vertical', class:'glyphicon glyphicon-resize-vertical'},
    {name:'resize-horizontal', class:'glyphicon glyphicon-resize-horizontal'},
    {name:'hdd', class:'glyphicon glyphicon-hdd'},
    {name:'bullhorn', class:'glyphicon glyphicon-bullhorn'},
    {name:'bell', class:'glyphicon glyphicon-bell'},
    {name:'certificate', class:'glyphicon glyphicon-certificate'},
    {name:'thumbs-up', class:'glyphicon glyphicon-thumbs-up'},
    {name:'thumbs-down', class:'glyphicon glyphicon-thumbs-down'},
    {name:'hand-right', class:'glyphicon glyphicon-hand-right'},
    {name:'hand-left', class:'glyphicon glyphicon-hand-left'},
    {name:'hand-up', class:'glyphicon glyphicon-hand-up'},
    {name:'hand-down', class:'glyphicon glyphicon-hand-down'},
    {name:'circle-arrow-right', class:'glyphicon glyphicon-circle-arrow-right'},
    {name:'circle-arrow-left', class:'glyphicon glyphicon-circle-arrow-left'},
    {name:'circle-arrow-up', class:'glyphicon glyphicon-circle-arrow-up'},
    {name:'circle-arrow-down', class:'glyphicon glyphicon-circle-arrow-down'},
    {name:'globe', class:'glyphicon glyphicon-globe'},
    {name:'wrench', class:'glyphicon glyphicon-wrench'},
    {name:'tasks', class:'glyphicon glyphicon-tasks'},
    {name:'filter', class:'glyphicon glyphicon-filter'},
    {name:'briefcase', class:'glyphicon glyphicon-briefcase'},
    {name:'fullscreen', class:'glyphicon glyphicon-fullscreen'},
    {name:'dashboard', class:'glyphicon glyphicon-dashboard'},
    {name:'paperclip', class:'glyphicon glyphicon-paperclip'},
    {name:'heart-empty', class:'glyphicon glyphicon-heart-empty'},
    {name:'link', class:'glyphicon glyphicon-link'},
    {name:'phone', class:'glyphicon glyphicon-phone'},
    {name:'pushpin', class:'glyphicon glyphicon-pushpin'},
    {name:'usd', class:'glyphicon glyphicon-usd'},
    {name:'gbp', class:'glyphicon glyphicon-gbp'},
    {name:'sort', class:'glyphicon glyphicon-sort'},
    {name:'sort-by-alphabet', class:'glyphicon glyphicon-sort-by-alphabet'},
    {name:'sort-by-alphabet-alt', class:'glyphicon glyphicon-sort-by-alphabet-alt'},
    {name:'sort-by-order', class:'glyphicon glyphicon-sort-by-order'},
    {name:'sort-by-order-alt', class:'glyphicon glyphicon-sort-by-order-alt'},
    {name:'sort-by-attributes', class:'glyphicon glyphicon-sort-by-attributes'},
    {name:'sort-by-attributes-alt', class:'glyphicon glyphicon-sort-by-attributes-alt'},
    {name:'unchecked', class:'glyphicon glyphicon-unchecked'},
    {name:'expand', class:'glyphicon glyphicon-expand'},
    {name:'collapse-down', class:'glyphicon glyphicon-collapse-down'},
    {name:'collapse-up', class:'glyphicon glyphicon-collapse-up'},
    {name:'log-in', class:'glyphicon glyphicon-log-in'},
    {name:'flash', class:'glyphicon glyphicon-flash'},
    {name:'log-out', class:'glyphicon glyphicon-log-out'},
    {name:'new-window', class:'glyphicon glyphicon-new-window'},
    {name:'record', class:'glyphicon glyphicon-record'},
    {name:'save', class:'glyphicon glyphicon-save'},
    {name:'open', class:'glyphicon glyphicon-open'},
    {name:'saved', class:'glyphicon glyphicon-saved'},
    {name:'import', class:'glyphicon glyphicon-import'},
    {name:'export', class:'glyphicon glyphicon-export'},
    {name:'send', class:'glyphicon glyphicon-send'},
    {name:'floppy-disk', class:'glyphicon glyphicon-floppy-disk'},
    {name:'floppy-saved', class:'glyphicon glyphicon-floppy-saved'},
    {name:'floppy-remove', class:'glyphicon glyphicon-floppy-remove'},
    {name:'floppy-save', class:'glyphicon glyphicon-floppy-save'},
    {name:'floppy-open', class:'glyphicon glyphicon-floppy-open'},
    {name:'credit-card', class:'glyphicon glyphicon-credit-card'},
    {name:'transfer', class:'glyphicon glyphicon-transfer'},
    {name:'cutlery', class:'glyphicon glyphicon-cutlery'},
    {name:'header', class:'glyphicon glyphicon-header'},
    {name:'compressed', class:'glyphicon glyphicon-compressed'},
    {name:'earphone', class:'glyphicon glyphicon-earphone'},
    {name:'phone-alt', class:'glyphicon glyphicon-phone-alt'},
    {name:'tower', class:'glyphicon glyphicon-tower'},
    {name:'stats', class:'glyphicon glyphicon-stats'},
    {name:'sd-video', class:'glyphicon glyphicon-sd-video'},
    {name:'hd-video', class:'glyphicon glyphicon-hd-video'},
    {name:'subtitles', class:'glyphicon glyphicon-subtitles'},
    {name:'sound-stereo', class:'glyphicon glyphicon-sound-stereo'},
    {name:'sound-dolby', class:'glyphicon glyphicon-sound-dolby'},
    {name:'sound-5-1', class:'glyphicon glyphicon-sound-5-1'},
    {name:'sound-6-1', class:'glyphicon glyphicon-sound-6-1'},
    {name:'sound-7-1', class:'glyphicon glyphicon-sound-7-1'},
    {name:'copyright-mark', class:'glyphicon glyphicon-copyright-mark'},
    {name:'registration-mark', class:'glyphicon glyphicon-registration-mark'},
    {name:'cloud-download', class:'glyphicon glyphicon-cloud-download'},
    {name:'cloud-upload', class:'glyphicon glyphicon-cloud-upload'},
    {name:'tree-conifer', class:'glyphicon glyphicon-tree-conifer'},
    {name:'tree-deciduous', class:'glyphicon glyphicon-tree-deciduous'}
];
