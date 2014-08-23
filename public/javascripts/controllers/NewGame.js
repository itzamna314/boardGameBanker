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
            if ( resourceType == 'player' )
                $scope.playerResources.push(res);
            else if ( resourceType == 'global' )
                $scope.globalResources.push(res);
        };

        $scope.createGame = function(){
            var playerRes = $scope.playerResources;
            playerRes = _.map(playerRes, function(pr){
                pr.visibility = pr.visibility.id;
                return pr;
            });

            httpWrapper.post('ajax/newgame',{
                title:$scope.title,
                players:$scope.players,
                playerResources:$scope.playerResources
            }).success(function(){
                $location.path('/games');
            });
        };

        $scope.activate = function(section, isRight){
            var oldSwitch = $('#switch-' + $scope.newGameActive);
            var newSwitch = $('#switch-' + section);

            oldSwitch.removeClass('transition-switch-left transition-switch-right');
            newSwitch.removeClass('transition-switch-left transition-switch-right');

            if ( isRight === undefined )
                isRight = sections[section] < sections[$scope.newGameActive];

            // Moving right, transition left
            if ( !isRight  )
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

        sections = {
            players:1,
            resources:2,
            globals:3
        };

        $scope.visibilities = [
            {name:'Visible', id:'visible'},
            {name:'Hidden', id:'hidden'}
        ];

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
                this.visibility = $scope.visibilities[0];
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
        scoreResource.visibility = $scope.visibilities[0];
        $scope.playerResources = [scoreResource];

        $scope.globalResources = [];


        httpWrapper.timeout = 1000;
        $rootScope.isActive = 'NewGame';

        $scope.newGameActive = 'players';

        $('body').addClass('with-bottom-nav');
    }
]);
