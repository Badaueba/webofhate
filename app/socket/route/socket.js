var socketio = require("socket.io");
exports.init = init;
var players = [];

function init (server) {
    var io = socketio.listen(server);
    console.log("socket.io listening...");

    io.on("connection", function (socket){
        console.log("new connection");
        socket.on("join", function (data){
            socket.nickname = data.name;
            console.log('join', data);
            players.push(data);
            socket.emit("list_of_players", players);
            socket.broadcast.emit("new_player", data);
            // console.log(players);
        });

        socket.on('playerMove', function (data){
            console.log('playerMove', data);
            socket.broadcast.emit('aplyMovement', data);
        });
    });

    io.on("disconnect", function (socket){
        console.log(socket.nickname + " disconnect...");
        players.forEach( function (player, index){
            if (player.name == socket.nickname){
                players.splice(index, 1);
            }
        });

        socket.broadcast.emit("remove_player", socket.nickname);
        console.log(players);

    })


}
