/**
 * Test for GamesList controller action
**/

describe("GamesList",function() {
    it("should have 2 games", function() {
        var scope = {};
        var gamesList = new GamesList(scope);

        expect(scope.games.length).toBe(2);
    });

    it("should have an entity name", function() {
        var scope = {};
        var gamesList = new GamesList(scope);

        expect(scope.entity).toBe("Players");
    })
})