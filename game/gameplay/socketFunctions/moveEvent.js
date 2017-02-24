var mainData = require('../../main/data');

module.exports = function (data) {
    console.log('move', data);
    for (var index = 0; index < mainData.players.length; index ++) {
        if (mainData.players[index].name == data.name){
            // mainData.players[index]['sprite'].animations.play(data.anim);
            console.log(mainData.players[index]['sprite'].animations);

            if (data.goinLeft || data.goingRight) {
                mainData.players[index]['sprite'].x += data.direction * data.speed;
            }
            else if (data.goinUp || data.goingDown) {
                mainData.players[index]['sprite'].y += data.direction * data.speed;
            }
            mainData.players[index]['sprite'].scale.x = data.direction;
            return;
        }
    }      
}