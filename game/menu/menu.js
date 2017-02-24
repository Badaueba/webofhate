var Gameplay = require('../gameplay/gameplay');
var data = require('../main/data.js');
var storage = require('../services/storage');

module.exports = function () {
    var game = data.game;

    var classes = data.classes;

    var Menu = {
        preload : preload,
        create : create,
        selection : selection,
    };

    function preload () {
        game.load.image('dwight', './assets/sprites/dwight_avatar.png');
        game.load.image('roo', './assets/sprites/roo_avatar.png');
    }

    var text;

    function create () {

        var style = {
            font: "bold 32px Arial",
            fill: "#fff",
            boundsAlignH: "center",
            boundsAlignV: "middle"
        };
        text = game.add.text(0, 0, "Select your character", style);
        text.setTextBounds(0, 50, 500, 100);
        text.x = Math.floor(this.width / 2 - 100);

        var dwightButton = this.add.button(game.width / 2 , 200, 'dwight', this.selection, this);
        dwightButton.player = classes.dwight;
        var rooButton = this.add.button(game.width / 2 - 90, 200, 'roo', this.selection, this);
        rooButton.player = classes.roo;
    }

    function selection(button) {
        var player = button.player;
        if (!game.device.desktop) {
            data.game.scale.startFullScreen(false);
        }
        data.myself = player;
        data.myself.name = storage.getItem('user');
        game.state.start("gameplay");
    }

    return Menu;
}