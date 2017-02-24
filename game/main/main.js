var data = require('./data.js');
var menu = require('../menu/menu.js');
var home = require('./home.js');
var gameplay = require('../gameplay/gameplay.js');

module.exports = function () {

    window.onload = function () {
        data.game = new Phaser.Game( 600 , 450, Phaser.CANVAS, "webofhate");
        data.game.state.add('menu', menu());
        data.game.state.add('home', home());
        data.game.state.add('gameplay', gameplay());
        data.game.state.start("home");
    }   
}


