var net = require('net')
var JSONStream = require('json-stream')

// connects and reports to the master server
function GameServerClient(externalIP, websocketPort, password) {
    this.isConnected = false

    this.ip = externalIP
    this.socket = null
    this.jsonStream = null
  
    this.password = password
    this.connectionCallback = function() {}
    this.masterServer = {
        ip: null,
        port: null
    }

    this.websocketPort = websocketPort
}

GameServerClient.prototype.connect = function(masterPort, masterIP, callback) {
    // store all of the connection information
    // this information will be used to reconnect if the connection is ever lost
    this.masterServer.port = masterPort
    this.masterServer.ip = masterIP
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
                self.connectionCallback
            )
        }, 5000)
    })

    this.socket.on('error', function(error) {
        console.log('MasterServer connection error', error)
        self.socket.destroy()
        self.socket.unref()
    })

    this.socket.connect(masterPort, masterIP, function() {
        self.send({
            password: self.password,
            externalIP: self.ip,
            port: self.websocketPort
        })
        self.isConnected = true
        console.log('Connected to MasterServer', masterIP+ ':' + masterPort)
    })
}

GameServerClient.prototype.send = function(message) {
    // delimiting json messages with \n is a requirement of JSONStream
    this.socket.write(JSON.stringify(message) + '\n')
}

module.exports = GameServerClient
