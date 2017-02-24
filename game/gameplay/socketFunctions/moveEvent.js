var mainData = require('../../main/data');

module.exports = function (data) {
    console.log('move', data);
    for (var index = 0; index < mainData.players.length; index ++) {
        if (mainData.players[index].name == data.name){
            mainData.players[index]['sprite'].animations.play(data.anim);
            // console.log(mainData.players[index]['sprite'].animations);

            mainData.players[index]['sprite'].x += data.directionX * data.speed;
            mainData.players[index]['sprite'].y += data.directionY * data.speed;
            if (data.directionX > 0)
                mainData.players[index]['sprite'].scale.x = data.directionX;
            return;
        }
    }
    mainData.playersGroup.sort('y', Phaser.Group.SORT_ASCENDING);      
}