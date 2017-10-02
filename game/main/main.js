var mainData = require('./data.js');
var menu = require('../menu/menu.js');
var home = require('./home.js');
var gameplay = require('../gameplay/gameplay.js');

module.exports = function () {

    window.onload = function () {
        mainData.game = new Phaser.Game( 600 , 450, Phaser.CANVAS, "webofhate");
        mainData.game.state.add('home', home());
        mainData.game.state.add('menu', menu);
        mainData.game.state.add('gameplay', gameplay);
        mainData.game.state.start("home");
    }   
}


