var socketio = require("socket.io");
exports.init = init;
var players = [];

function init (server) {
    var io = socketio.listen(server);
    console.log("socket.io listening...");

    io.on("connection", function (socket){
        console.log("new connection");
        socket.on("join", function (data){
            console.log("someone join");
            console.log(data);
            socket.nickname = data.name;
            var player = {"name" : data.name, "character" : data.character};
            players.push(player);
            socket.emit("list_of_players", players);
            socket.broadcast.emit("new_player", player);
            console.log(players);
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
