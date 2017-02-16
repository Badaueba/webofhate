
var game = window.game;
var Menu = {
    preload : preload,
    create : create,
    update : update,
    selectionDwight : selectionDwight,
    selectionRoo : selectionRoo
};

var players = {
    roo : {
        name : '',
        character : 'roo',
        animations : {
            walkLeft : [18, 19, 20],
            walkRight : [18, 19, 20],
            idle : [0, 1, 2, 3]
        },
        speed : 3
    },

    dwight : {
        name : '',
        character : 'dwight',
        animations : {
            walkLeft : [6, 7],
            walkRight : [6, 7],
            idle : [0, 1, 2, 3]
        },
        speed : 1.5
    }
}

function preload () {
    game.load.image('dwight', 'game/sprites/dwight_avatar.png');
    game.load.image('roo', 'game/sprites/roo_avatar.png');
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

    dwight = this.add.button(window.game.width / 2 , 200, 'dwight', this.selectionDwight, this);
    roo = this.add.button(window.game.width / 2 - 90, 200, 'roo', this.selectionRoo, this);

}

function update () {
    text.x = Math.floor(this.width / 2 - 100);
}

function selectionDwight () {
    if (!game.device.desktop) {
        window.game.scale.startFullScreen(false);
    }
    window.game.players = players;
    players.dwight.name = window.localStorage.getItem("username");
    window.game.myPlayer = players.dwight;
    window.game.state.start("Gameplay");
}
function selectionRoo () {
    if (!game.device.desktop) {
        window.game.scale.startFullScreen(false);
    }
    window.game.players = players;
    players.roo.name = window.localStorage.getItem("username");
    window.game.myPlayer = players.roo;
    window.game.state.start("Gameplay");
}
