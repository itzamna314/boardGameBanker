/**
 * Test for the NewGame controller action
**/

describe("NewGame",function(){
    var scope, controller, newGameCtrl,rootScope,location,$httpBackend;

    beforeEach(angular.mock.module('bgbApp'));

    // Create a new Welcome controller with default scope, cookies, and http
    beforeEach(angular.mock.inject(function(_$httpBackend_,$rootScope,$controller,$location){
        $httpBackend = _$httpBackend_;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        location = $location;
        controller = $controller;
        spyOn(location,'path');

        rootScope.user = {id:3,username:'Noah',email:'anthropologist@pirate-fortress.com'};
        newGameCtrl = controller('NewGame',{$scope:scope});
    }));

    describe("constructor",function(){
        it("should redirect if rootScope user is not set",function()
        {
            rootScope.user = null;
            newGameCtrl = controller('NewGame',{$scope:scope});
            expect(location.path).toHaveBeenCalledWith('/');
        });
    });

    describe(".addPlayer",function(){

        it("should have two players initially - current user and a blank slot",function()
        {
            rootScope.user = {id:3,username:'Noah',email:'anthropologist@pirate-fortress.com'};
            newGameCtrl = controller('NewGame',{$scope:scope});
            expect(scope.players.length).toBe(2);
            expect(scope.players[0].idx).toBe(0);
            expect(scope.players[0].email).toBe('anthropologist@pirate-fortress.com');
            expect(scope.players[1].idx).toBe(1);
            expect(scope.players[1].email).toBe(null);
        });

        it("should create new players on the players scope variable",function()
        {
            scope.addPlayer();
            expect(scope.players.length).toBe(3);
            expect(scope.players[2].idx).toBe(2);
            expect(scope.players[2].email).toBe(null);
        });
    })

});