var net = require('net')
var JSONStream = require('json-stream')

// connects and reports to the master server
function GameServerClient(websocketPort) {
    this.isConnected = false

    this.socket = null
    this.jsonStream = null
  
    this.password = null
    this.connectionCallback = function() {}
    this.masterServer = {
        ip: null,
        port: null
    }

    this.websocketPort = websocketPort 
}

GameServerClient.prototype.connect = function(port, ip, password, callback) {
    // store all of the connection information
    // this information will be used to reconnect if the connection is ever lost
    this.masterServer.port = port
    this.masterServer.ip = ip
    this.password = password
    this.connectionCallback = callback


    this.socket = new net.Socket()
    this.jsonStream = JSONStream()
    this.socket.pipe(this.jsonStream)

    var self = this

    this.jsonStream.on('data', function(json) {
        if (typeof json.authenticated !== 'undefined') {
            // authenticated!
            self.connectionCallback()
        }

        if (typeof json.message !== 'undefined') {
            console.log('MasterServer says', json.message)
        }
    })

    this.socket.on('close', function() {
        console.log('MasterServer connection closed')
        // try to reconnect every 5 seconds
        setTimeout(function() {
            console.log('Retrying MasterServer connection...')
            self.connect(
                self.masterServer.port,
                self.masterServer.ip, 
                self.password, 
                self.connectionCallback
            )
        }, 5000)
    })

    this.socket.on('error', function(error) {
        console.log('MasterServer connection error', error)
        self.socket.destroy()
        self.socket.unref()
    })

    this.socket.connect(port, ip, function() {
        self.send({
            password: password,
            port: self.websocketPort
        })
        self.isConnected = true
        console.log('Connected to MasterServer', ip + ':' + port)
    })
}

GameServerClient.prototype.send = function(message) {
    this.socket.write(JSON.stringify(message) + '\n')
}

module.exports = GameServerClient
