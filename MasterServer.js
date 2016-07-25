var net = require('net')
var express = require('express')
var GameServer = require('./GameServer')
var JSONStream = require('json-stream')

var id = 0
var gameServerPassword = 'kitaaty'

// master server, tracks running game servers, provides servers list via http api
function MasterServer(ip, tcpPort, httpPort) {
    this.gameServers = []

    this.ip = ip
    this.tcpPort = tcpPort
    this.httpPort = httpPort

    this.tcpServer = this._createTCPServer(ip, tcpPort)
    this.httpServer = this._createHTTPServer(httpPort)
}

MasterServer.prototype._createTCPServer = function(ip, tcpPort) {
    var master = net.createServer()

    var self = this
    master.on('connection', function(socket) {
        console.log('GameServer connected', socket.remoteAddress, socket.remotePort)

        var stream = JSONStream()
        socket.pipe(stream)

        var gameServer = new GameServer(socket)

        stream.on('data', function(message) {
            console.log('message', message)
            // the authentication message. Has a password and a port
            if (typeof message.password !== 'undefined') {
                if (isValidPassword(message.password) && typeof message.port !== 'undefined') {
                    self._registerServer(gameServer, message.port)
                    socket.write(JSON.stringify({authenticated: true}) + '\n')
                } else {
                    if (!isValidPassword(message.password)) {
                        socket.write(JSON.stringify({message: 'incorrect password'}) + '\n')
                    }
                    if (typeof message.port === 'undefined') {
                        socket.write(JSON.stringify({message: 'no game server port specified'}) + '\n')
                    }
                    socket.destroy()
                    return
                }
            }

            // info about the game state
            if (typeof message.gameState !== 'undefined') {
                self._receiveUpdate(gameServer, message.gameState, message.currentPlayers, message.maxPlayers)
            }
        })

        socket.on('close', function() {
            self._removeServer(gameServer)
        })

        socket.on('error', function(error) {
            console.log('socket error', error, 'from client', gameServer.ip)
        })
    })

    master.listen(tcpPort, ip)
    console.log('MasterServer TCP api running on', ip + ':' + tcpPort)
    return master
}

MasterServer.prototype._removeServer = function(gameServer) {
    for (var i = 0; i < this.gameServers.length; i++) {
        var server = this.gameServers[i]
        if (server.id === gameServer.id) {
            this.gameServers.splice(i, 1)
        }
    }
}

MasterServer.prototype._registerServer = function(gameServer, port) {
    gameServer.isAuthenticated = true
    gameServer.port = port
    gameServer.id = id++
    this.gameServers.push(gameServer)
    console.log(gameServer.ip + ' is authenticated')
}

MasterServer.prototype._receiveUpdate = function(gameServer, gameState, currentPlayers, maxPlayers) {
    gameServer.gameState = gameState
    gameServer.currentPlayers = currentPlayers
    gameServer.maxPlayers = maxPlayers
}

// see https://nodejs.org/api/tls.html for less hacky security
var isValidPassword = function(password) {
    return password === gameServerPassword // pick your own password
}

MasterServer.prototype.getServers = function() {
    var servers = []

    for (var i = 0; i < this.gameServers.length; i++) {
        var gameServer = this.gameServers[i]

        if (!gameServer.isAuthenticated) { continue }

        var serverDescription = {}
        if (typeof gameServer.ip !== 'undefined') {
            serverDescription.ip = gameServer.ip
        }
        if (typeof gameServer.port !== 'undefined') {
            serverDescription.port = gameServer.port
        }
        if (typeof gameServer.currentPlayers !== 'undefined') {
            serverDescription.currentPlayers = gameServer.currentPlayers
        }
        if (typeof gameServer.maxPlayers !== 'undefined') {
            serverDescription.maxPlayers = gameServer.maxPlayers
        }

        if (typeof gameServer.gameState !== 'undefined') {
            serverDescription.gameState = gameServer.gameState
        }

        servers.push(serverDescription)
    }

    return servers
}

MasterServer.prototype._createHTTPServer = function(port) {
    var app = express()
    var self = this

    app.get('/', function (req, res) {
        res.send(JSON.stringify(self.getServers()))
    })

    app.listen(port, function () {
        console.log('MasterServer HTTP api running on', 'http://' + self.ip + ':' + port )
    })

    return app
}

module.exports = MasterServer
