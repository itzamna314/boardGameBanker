/**
 * Test for the NewGame controller action
**/

describe("NewGame",function(){
    var scope, http, cookies, window, newGameCtrl;

    beforeEach(function(){
        scope = {};
        http = {};
        cookies = {};
        window = {location:{}};
        newGameCtrl = new NewGame(scope,http,cookies,window);
    });

    describe("constructor",function(){
        it("should redirect if cookie is not set",function()
        {
            expect(window.location.href).toBe('/');
        });
    });

    describe(".addPlayer",function(){

        beforeEach(function(){
            cookies = {user:JSON.stringify({email:'test-email@test.com'})};
            newGameCtrl = new NewGame(scope,http,cookies,window);
        });

        it("should have two players initially - current user and a blank slot",function()
        {
            expect(scope.players.length).toBe(2);
            expect(scope.players[0].idx).toBe(0);
            expect(scope.players[0].email).toBe('test-email@test.com');
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