var Menu = require('../menu/menu.js');
var Home = require('./home.js');

module.exports = function () {

    window.onload = function () {
        window.game = new Phaser.Game( 450 , 450, Phaser.CANVAS, "webofhate");
        window.game.state.add('Menu', Menu());
        window.game.state.add('Home', Home());
        // window.game.state.add('Gameplay', Gameplay);
        window.game.state.start("Home");
    }
    
}


