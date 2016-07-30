# node-master-game-server
A master server that maintains a list of active game servers. GameServerClient.js is a component that game servers can use to list themselves with the master server.

## Running the example
1. Run exampleMaster.js, this is a master server.
2. Run one or more instances of exampleClient.js, these will connect to the master server.
3. Visit http://localhost:8081/servers to see the listing of all the (somewhat fake) game servers.

The webpage at the above url will have information about the address and player count of the game servers. Servers can be added, removed, or changed, and refreshing the webapge will show these changes.

## Real useage
I have a multiplayer HTML5 game (uses websockets) for which I host multiple servers. One server is the MasterServer. The other servers are individual game servers. These individual game servers use the GameServerClient to register themselves with the MasterServer. The most important information about my game servers is the address at which they accept websocket connections (ip and port). The HTML5 game client can thus get a list of these addresses from MasterServer and connect to any game server.


