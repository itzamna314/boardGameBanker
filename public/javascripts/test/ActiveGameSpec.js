/**
 * Created by Kyl on 7/11/2014.
 */

describe("Active Game",function()
{
    var scope,cookies,$httpBackend,activeGameCtrl,rootScope,routeParams;

    beforeEach(angular.mock.module('bgbApp'));

    // Create a new Welcome controller with default scope, cookies, and http
    beforeEach(angular.mock.inject(function(_$httpBackend_,$rootScope,$controller,$routeParams){
        $httpBackend = _$httpBackend_;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        routeParams = $routeParams;
        cookies = {};

        rootScope.user = {
            email:'foo@bar.com',
            username:'foobar',
            id:1,
            found:true
        };

        scope.game = {
            name:'Checkers',
            id:5
        };

        routeParams.id = 5;

        activeGameCtrl = $controller('ActiveGame',{$scope:scope,$cookies:cookies});
        $httpBackend.expectGET('ajax/gamedetail/5/1').respond(500);
    }));

    describe('.addPoints',function(){
       it('should store points if the server is unresponsive',function()
       {
          $httpBackend.flush();
          $httpBackend.resetExpectations();
          $httpBackend.expectPOST('ajax/gameaddpoints/5/1','{"number":3}').respond(500);

           scope.addPoints(3);
           $httpBackend.flush();
           expect(scope.storedPoints).toEqual(3);

           $httpBackend.expectGET('ajax/gamedetail/5/1').respond(500);
           $httpBackend.expectPOST('ajax/gameaddpoints/5/1','{"number":3}').respond(200,{game:{myscore:3},players:{}});

           scope.refreshScore();
           $httpBackend.flush();
           expect(scope.storedPoints).toEqual(0);
           expect(scope.game.myscore).toEqual(3);
       });
    });
});
