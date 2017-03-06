var mainData = require('../main/data');
module.exports = function (playerData) {

    game = mainData.game;
    var playerClass = mainData.classes[playerData.character];
    var player = {};
    player.sprite = mainData.playersGroup.create(playerData.x, playerData.y, playerData.character);

    player.name = playerData.name;
    player.direction = 1;
    player.goingLeft = false;
    player.goingRight = true;
    player.goingUp = false;
    player.goingDown = false;
    player.orientation = "walkRight";
    player.sprite.animations.add("walkRight", playerClass.animations.walkRight);
    player.sprite.animations.add("walkLeft", playerClass.animations.walkLeft);
    player.sprite.animations.add("idle", playerClass.animations.idle );
    mainData.players.push(player);

    if (playerData.name === mainData.myself.name) {
        mainData.myself.sprite = player.sprite;
        // mainData.game.camera.follow(player);
        // mainData.game.camera.x = player.x;
        // mainData.game.camera.y = player.y;
    }
    mainData.playersGroup.sort();
    console.log('playerSprites', mainData.players);   
}