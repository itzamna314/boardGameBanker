function GamesList($scope) {
    $scope.games = [
        {
            "name":"Smallworld",
            "players":"test"/*{
                {"name":"Kim"},
                {"name":"Annie"},
                {"name":"Hannah"}
            }*/
        },
        {
            "name":"Game Of Thrones",
            "players":"another test"/*{
                {"name":"Alex"},
                {"name":"Mike"},
                {"name":"Ryan"},
            }*/
        }
    ]

    $scope.entity = "Players"
}

function foo(){ alert('Foo!'); }