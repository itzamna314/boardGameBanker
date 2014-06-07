/**
 * Test for GamesList controller action
**/

describe("Player",function() {
    it("should have 2 games", function() {
        var scope = {};
        var gamesList = new GamesList(scope);

        expect(scope.games.length).toBe(2);
    });
})