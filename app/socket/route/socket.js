var socketio = require("socket.io");
exports.init = init;
var players = [];

function init (server) {
    var io = socketio.listen(server);
    console.log("socket.io listening...");

    io.on("connection", function (socket){
        var userID;
        console.log("new connection");
        socket.on("join", function (data){
            socket.nickname = data.name;
            userID = socket.id;
            data.userID = userID;
            players.push(data);
            socket.broadcast.emit("new_player", data);
        });

        socket.on('list_of_players', function (){
            socket.emit("list_of_players", players);
        });

        socket.on('playerMove', function (data){
            console.log('playerMove', data);
            socket.broadcast.emit('movementEvent', data);
            socket.emit('movementEvent', data);
        });

        socket.on("disconnect", function (socket){
            console.log(userID + " disconnect...");
            var playerName;
            players.forEach( function (player, index){
                if (player.userID == userID){
                    players.splice(index, 1);
                    playerName = player.name;
                }
            });
            io.sockets.emit('remove_player', playerName);
        });

    });

}
