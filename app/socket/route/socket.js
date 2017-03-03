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
            var x = Math.floor(Math.random() * 300);
            var y = Math.floor(Math.random() * 300);
            data.x = x;
            data.y = y;
            players.push(data);
            socket.broadcast.emit("new_player", data);
        });

        socket.on('list_of_players', function (){
            socket.emit("list_of_players", players);
        });

        socket.on('playerMove', function (data){
            socket.broadcast.emit('move_event', data);
            socket.emit('move_event', data);
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
