var mainData = require('./data.js');
var auth = require('../auth/auth.js');

module.exports = function () {
    var game = mainData.game;
    var home = {
        preload : preload,
        create : create,
        authModal : authModal,
    };

    function preload () {
        game.load.image('signin_button', './assets/sprites/signin_button.png');
    }

    function create () {
        
        
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        this.scale.forceOrientation(true, false);
        var signin_button =
            this.add.button(game.width / 2 -100, game.height/2 - 50, 'signin_button', this.authModal, this);
        signin_button.scale.setTo(0.2, 0.2);

    }
    function authModal () {
        auth();
        $('#authModal').modal('show');
    };

    return home;
}
