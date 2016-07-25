
var MasterServer = require('./MasterServer')

var ip = '127.0.0.1'
var tcpPort = 1337
var httpPort = 8080

var master = new MasterServer(ip, tcpPort, httpPort)

/*
* Run one or more GameServerClient(s) and connect them to 127.0.0.1:1337
* Run a webbrowser and goto http://127.0.0.1:8080 to see the server listings
*/