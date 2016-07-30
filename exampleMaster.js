var MasterServer = require('./MasterServer')

var ip = '0.0.0.0' //listen on 127.0.0.1 for local-only, 0.0.0.0 for internet
var tcpPort = 1337
var httpPort = 8081

var master = new MasterServer(ip, tcpPort, httpPort)

/*
* Run one or more exampleClients and connect them to localhost:1337
* Run a webbrowser and goto http://localhost:8081/servers to see the server listings.
* Example 3 connected servers (with slightly different configuration than this demo):
* [
*   {"ip":"123.123.123.123","port":51850,"currentPlayers":0,"maxPlayers":40,"gameState":0},
*   {"ip":"123.123.123.123","port":51853,"currentPlayers":0,"maxPlayers":40,"gameState":0},
*   {"ip":"123.123.123.123","port":8888,"currentPlayers":6,"maxPlayers":40,"gameState":1}
* ]
*/