var mainData = require('../../main/data');

module.exports = function (name) {
    console.log("removing: " + name);
    
    mainData.players.forEach (function (player, index) {
        if (player.name == name) {
            mainData.players.splice(index, 1);
            return;
        }
    });

    console.log(mainData.players);
}