module.exports = function () {
    var game = window.game;
    
    var Home = {
        preload : preload,
        create : create,
        auth : auth,
    };

    function preload () {
        window.game.load.image('signin_button', 'game/sprites/signin_button.png')

    }

    function create () {
        window.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        //window.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.forceOrientation(true, false);
        var signin_button =
            this.add.button(game.width / 2 -100, game.height/2 - 50, 'signin_button', this.auth, this);
        signin_button.scale.setTo(0.2, 0.2);

    }
    function auth () {
        $('#authModal').modal('show');
    };

    return Home;
}
