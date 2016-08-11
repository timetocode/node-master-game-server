# node-master-game-server
A master server that maintains a list of active game servers. GameServerClient.js is a component that game servers can use to list themselves with the master server.

## Running the example
0. npm install
1. node exampleMaster.js // runs the master server
2. node exampleClient.js // runs a client, open as many as you want
3. visit in your browser: [http://localhost:8081/servers](http://localhost:8081/servers) to see the json api reporting the connected clients 

The webpage at the above url will have information about the address and player count of the game servers. Servers can be added, removed, or changed, and refreshing the webpage will show these changes.

## Real use
The data sent from the client to the master in the example begins with an ip and port. These aren't used in the example, and are only data. In the real world, this ip and port sent to the master should be useable to connect a game. This gets confusing as there are numerous client-server relationships. 

Here is the full relationship between the parts that I currently use:

MasterServer - runs code very similar to exampleMaster.js
GameServer - runs a whole websocket game, also uses code very siumilar to exampleClient to list this game server with the master
GameClient - an HTML5 game, made in webgl and websockets

I begin by turning on the master server. I then run numerous game servers all open on different ports. These become listed by the master server.

The GameClient contains a server browser, which makes a call to the http://localhost:8081/servers api. The user can then select one of these servers from the list, and hit connect. The GameClient then connects to the chosen GameServer and the game begins.


