
var publicIp = require('public-ip')

var GameServerClient = require('./GameServerClient')
var MatchState = require('./MatchState')

var password = 'kitty'
var masterServerIP = 'localhost' // or mygame.com, or 123.123.123.123
var masterServerPort = 1337

// Start a game with a websocket server (not shown in this demo) then use this component to
// connect to the master server 

// NOTE: if you pass a port of 0 to a websocket server the os will assign it a port
// and then you can get that assigned port via websocketServer.address().port
// this example just makes up a port and doesn't use it.
var websocketPort = 8888    

// lookup our externalIP
publicIp.v4().then(function(externalIP) {

    // list ourselves with the master server
    var gameServerClient = new GameServerClient(externalIP, websocketPort, password)
    gameServerClient.connect(masterServerPort, masterServerIP, function() {
        gameServerClient.send({
            gameState: MatchState.Lobby, // making up data
            currentPlayers: 6, // making up data
            maxPlayers: 40 // making up data
        })

        // example: changing this gameServer's information 10 seconds after starting
        /*
        setTimeout(function() {
            gameServerClient.send({
                gameState: MatchState.MatchInProgress, 
                currentPlayers: 39,
                maxPlayers: 40
            })
        }, 10000)
        */
    })
})
