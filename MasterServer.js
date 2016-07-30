var net = require('net')
var express = require('express')
var GameServerListing = require('./GameServerListing')
var JSONStream = require('json-stream')

var id = 0
var gameServerPassword = 'kitty' // pick a password

// master server: tracks running game servers, provides servers list via http json api
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

        var gameServer = new GameServerListing(socket)

        stream.on('data', function(message) {
            // the authentication message. Has a password, ip, and port from the game server
            if (typeof message.password !== 'undefined') {
                if (isValidPassword(message.password) && typeof message.port !== 'undefined') {
                    self._registerServer(gameServer, message.externalIP, message.port)
                    // delimiting json messages with \n is a requirement of JSONStream
                    self.send(socket, { authenticated: true })
                } else {
                    if (!isValidPassword(message.password)) {
                        self.send(socket, { message: 'incorrect password' })
                    }
                    if (typeof message.port === 'undefined') {
                        self.send(socket, { message: 'no game server port specified' })
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

MasterServer.prototype.send = function(socket, message) {
    // delimiting json messages with \n is a requirement of JSONStream
    socket.write(JSON.stringify(message) + '\n')
}

MasterServer.prototype._registerServer = function(gameServer, externalIP, port) {
    gameServer.isAuthenticated = true
    gameServer.ip = externalIP
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
    return password === gameServerPassword
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
    var self = this

    var app = express()
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
    })
    
    app.get('/servers', function (req, res) {
        res.send(JSON.stringify(self.getServers()))
    })

    app.listen(port, function () {
        console.log('MasterServer HTTP api running on', 'http://' + self.ip + ':' + port + '/servers' )
    })

    return app
}

module.exports = MasterServer
