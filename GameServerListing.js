var MatchState = require('./MatchState')

// representation of a game server from the perspective of the master server
function GameServerListing(socket) {
    this.isAuthenticated = false

    this.id = -1
    this.socket = socket

    //IP and port together can be used by game clients to connect to this server and play
    this.ip = socket.remoteAddress    
    this.port = null    

    // game-specific properties, add whatever
    this.gameState = MatchState.Unknown
    this.maxPlayers = 0
    this.currentPlayers = 0    
}

module.exports = GameServerListing