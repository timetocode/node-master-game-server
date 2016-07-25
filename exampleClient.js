
var GameServerClient = require('./GameServerClient')
var GameState = require('./GameState')

// made up data for this client
var websocketPort = 8001

var gameServerClient = new GameServerClient(websocketPort)
gameServerClient.connect(1337, '127.0.0.1', 'kitty', function() {
    gameServerClient.send({
        gameState: GameState.Lobby, 
        currentPlayers: 6,
        maxPlayers: 40
    })

    // example: changing the gameServer's information 5 seconds after connecting
    setTimeout(function() {
        gameServerClient.send({
            gameState: GameState.MatchInProgress, 
            currentPlayers: 39,
            maxPlayers: 40
        })
    }, 5000)
})
