bgbControllers.controller('NewGame',[
    '$scope',
    '$rootScope',
    '$location',
    'httpWrapper',
    function($scope,$rootScope,$location,httpWrapper){
        var PlayerFactory, ResourceFactory, selfPlayer, firstPlayer, sections, scoreResource;

        $scope.addPlayer = function(){
            $scope.players.push(PlayerFactory.newPlayer());
        };

        $scope.addResource = function(resourceType){
            var res = ResourceFactory.newResource();
            res.type = resourceType;
            $scope.resources.push(res);
        };

        $scope.createGame = function(){
            httpWrapper.post('ajax/newgame',{title:$scope.title,players:$scope.players}).success(function(){
                $location.path('/games');
            });
        };

        $scope.activate = function(section){
            var oldSwitch = $('#switch-' + $scope.newGameActive);
            var newSwitch = $('#switch-' + section);

            oldSwitch.removeClass('transition-switch-left transition-switch-right');
            newSwitch.removeClass('transition-switch-left transition-switch-right');

            if ( sections[section] > sections[$scope.newGameActive] )   // Moving right, transition left
            {
                oldSwitch.addClass('transition-switch-left');
                newSwitch.addClass('transition-switch-left');
            }
            else
            {
                oldSwitch.addClass('transition-switch-right');
                newSwitch.addClass('transition-switch-right');
            }

            $scope.newGameActive = section;
        };

        // Constructor
        if ( !$rootScope.user || !$rootScope.user.email ){
            $location.path('/');
            return;
        }

        PlayerFactory = (function(){
            var idx = 0;

            function Player(){
                this.email = null;
                this.idx = null;
                this.isCreator = null;
            }

            return {
                newPlayer:function(){
                    var player = new Player();
                    player.idx = idx;
                    idx++;
                    return player;
                },
                init:function(){
                    idx = 0;
                    return this;
                }
            }
        })();

        ResourceFactory = (function(){
            var idx = 0;

            function Resource(){
                this.idx = null;
                this.type = null;
                this.name = null;
                this.iconClass = null;
                this.color = null;
                this.visibility = null;
                this.initialValue = null;
                this.winCondition = null;
                this.conditionValue = null;
            }

            return {
                newResource:function(){
                    var resource = new Resource();
                    resource.idx = idx;
                    idx++;
                    return resource;
                },
                init:function(){
                    idx = 0;
                    return this;
                }
            }
        })();

        selfPlayer = PlayerFactory.init().newPlayer();
        selfPlayer.email = $rootScope.user.email;
        selfPlayer.isCreator = true;

        firstPlayer = PlayerFactory.newPlayer();
        $scope.players = [selfPlayer,firstPlayer];

        scoreResource = ResourceFactory.init().newResource();
        scoreResource.type = 'player';
        scoreResource.name = 'Score';
        scoreResource.initialValue = 0;
        $scope.playerResources = [scoreResource];


        httpWrapper.timeout = 1000;
        $rootScope.isActive = 'NewGame';

        $scope.newGameActive = 'players';

        sections = {
            players:1,
            settings:2,
            resources:3
        };

        $('body').addClass('with-bottom-nav');
        var defaultResource = new Resource();
        defaultResource.resourceId = -1;
        defaultResource.name = 'Points';
        defaultResource.startValue = 0;
        defaultResource.visibility = 'public';
        $scope.resources = [defaultResource];
    }
]);
