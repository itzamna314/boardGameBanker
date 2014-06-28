/**
 * Test for GamesList controller action
**/

describe("GamesList",function() {
    var scope,$httpBackend,gamesListCtrl,rootScope,location,controller;

    beforeEach(angular.mock.module('bgbApp'));

    // Create a new Welcome controller with default scope, cookies, and http
    beforeEach(angular.mock.inject(function(_$httpBackend_,$rootScope,$controller,$location){
        $httpBackend = _$httpBackend_;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        location = $location;
        spyOn(location,'path');
        controller = $controller;
    }));

    it("should redirect is user isn't set", function() {
        gamesListCtrl = controller('GamesList',{$scope:scope});
        expect(location.path).toHaveBeenCalledWith('/');
    });

    it("should get a list of games if user is set", function() {
        rootScope.user = {id:3,username:'Emmit',email:'everythingisawesome@awesome.awesome'};
        $httpBackend.expectGET('ajax/games/3').respond({games:[
            {
                name:'Pickup Sticks',
                created:'1/1/2011 7:32 AM',
                creator:{
                    username:'Beef Jerkey Guy',
                    id:5,
                    email:'beef@gmail.com'
                }
            },
            {
                name:'Checkers',
                created:'1/1/2011 7:33 AM',
                creator:{
                    username:'Batman',
                    id:8,
                    email:'everythingisdarkness@yahoo.com'
                }
            }
        ]});
        gamesListCtrl = controller('GamesList',{$scope:scope});
        $httpBackend.flush();

        expect(scope.games.length).toBe(2);
        expect(scope.games[0].name).toBe('Pickup Sticks');
        expect(scope.games[1].creator.username).toBe('Batman');
    })
});