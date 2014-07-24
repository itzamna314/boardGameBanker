bgbControllers.controller('GamesList',[
    '$scope',
    '$rootScope',
    '$location',
    'httpWrapper',
    function($scope,$rootScope,$location,httpWrapper) {
        $rootScope.isActive = 'GamesList';

        /************************ Public **********************************/
        $scope.gameDetail = function(id){
          $location.path('/games/active/' + id);
        };

        $scope.deleteGame = function(id,$event){
            $event.stopPropagation();

            var toDelete = _.find($scope.games,{id:id});
            var confirmed = confirm("Really delete " + toDelete.name + "?");
            if ( confirmed ) {
                toDelete.deleted = true;
                httpWrapper.post('ajax/deletegame',{gameId:id,userId:$rootScope.user.id}).success(function () {
                    updateGames();
                });
            }
        };

        /******************* Private ************************************/
        function updateGames() {
            httpWrapper.get('ajax/games/' + $rootScope.user.id).success(function (data) {
                $scope.games = data.games;
                $scope.createdAny = _.some(data.games,function(g){
                    return g.creator.id == $rootScope.user.id;
                })
            });
        }

        /************************ Constructor *****************************/
        if ( !$rootScope.user || !$rootScope.user.email || !$rootScope.user.id) {
            $location.path('/');
            return;
        }

        updateGames();
    }
]);
