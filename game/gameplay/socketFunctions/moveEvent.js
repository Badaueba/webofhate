var mainData = require('../../main/data');

module.exports = function (data) {
    for (var index = 0; index < mainData.players.length; index ++) {
        if (mainData.players[index].name == data.name){
            mainData.players[index]['sprite'].x += data.directionX * data.speed;
            mainData.players[index]['sprite'].y += data.directionY * data.speed;
            if (data.directionX !== 0)
                mainData.players[index]['sprite'].scale.x = data.directionX;

            if (data.anim != mainData.players[index]['sprite'].animations.currentAnim.name) {
                mainData.players[index]['sprite'].animations.play(data.anim, 5, true);
            }
            return;
        }
    }    
}