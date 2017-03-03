var mainData;

module.exports = function () {
    mainData = require('../main/data'); 
    var createBMD = require('../graphicHelpers/createBMD');

    var game = mainData.game;

    var gameplay = {
        preload : preload,
        create : create,
        update : update,
        render : render,
        toggleFullscreen : toggleFullscreen,
        pressButtonA : pressButtonA,
        pressButtonB : pressButtonB
    };

    var map;
    var tileset;
    var layer;

    var myPlayer;
    var players;

    var group;
    var UIgroup;
    var oldY = 0;
    var cursors;
    var locs = [];
    var randX;
    var randY;
    var life;
    var totalLife;
    var socket;

    function preload() {
        socket = io();
        players = [];
        
        group = new Phaser.Group(mainData.game, null, 'playersGroup', true, false, 0);
        UIgroup = new Phaser.Group(mainData.game, null, 'UIgroup', true, false, 0)
        mainData.playersGroup = group;

        game.renderer.renderSession.roundPixels = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //map
        game.load.tilemap('desert', './assets/tilemaps/maps/depthsort.json',
            null, Phaser.Tilemap.TILED_JSON);
        game.load.image('ground_1x1', './assets/tilemaps/tiles/ground_1x1.png');

        //players
        game.load.spritesheet('dwight', './assets/sprites/dwight.png', 80, 80);
        game.load.spritesheet('roo', './assets/sprites/roo.png', 80, 80);

        game.load.image('dwight-avatar', './assets/sprites/dwight_avatar.png');
        game.load.image('roo-avatar', './assets/sprites/roo_avatar.png');

        //fullscreen
        game.load.image('full_screen_icon', './assets/sprites/full_screen_icon.png', 40, 40);

        game.world.setBounds(0, 0, 800,450);

        //cursors
        if (!game.device.desktop){
            game.load.image('vjoy_base', './assets/sprites/base.png');
            game.load.image('vjoy_body', './assets/sprites/body.png');
            game.load.image('vjoy_cap', './assets/sprites/cap.png');
        }
        game.load.image('button_a', './assets/sprites/button_a.png');
        game.load.image('button_b', './assets/sprites/button_b.png');

    }

    function socketConfig() {

        var connect = require('./socketFunctions/connect');
        var listOfPlayers = require('./socketFunctions/listOfPlayers');
        var newPlayer = require('./socketFunctions/newPlayer');
        var removePlayer = require('./socketFunctions/removePlayer');
        var moveEvent = require('./socketFunctions/moveEvent');

        socket.on('connect', connect);
        socket.on('list_of_players', listOfPlayers);
        socket.on('new_player', newPlayer);
        socket.on('remove_player', removePlayer);
        socket.on('move_event', moveEvent);

        socket.emit("join", {
            name : mainData.myself.name,
            character : mainData.myself.character
        });
        socket.emit('list_of_players');

    }

    function create() {
        //joystick
        //pad
        // if(!game.device.desktop) {
        //     game.vjoy = game.plugins.add(Phaser.Plugin.VJoy);
        //     game.vjoy.inputEnable();
        // }
        cursors = game.input.keyboard.createCursorKeys();
        map = game.add.tilemap('desert');
        map.addTilesetImage('ground_1x1');
        layer = map.createLayer('Tile Layer 1');
        var fullscreen_button = game.add.button( game.camera.x + 550, 0, 'full_screen_icon', this.toggleFullscreen, this );
        fullscreen_button.fixedToCamera = true;
        var buttonA = game.add.button( game.width - 120, game.height -45, 'button_a', this.pressButtonA, this );
        buttonA.fixedToCamera = true;
        var buttonB = game.add.button( game.width - 60, game.height -45, 'button_b', this.pressButtonB, this );
        buttonB.fixedToCamera = true;
        UIgroup.add(fullscreen_button);
        UIgroup.add(buttonA);
        UIgroup.add(buttonB);

        var playerAvatar = this.game.add.sprite(0, 0, mainData.myself.character + '-avatar');
        UIgroup.add(playerAvatar);

        var bmd = createBMD(160, 32, "#4d394b");
        var bglife = this.game.add.sprite( playerAvatar.width + (bmd.width / 2),
            bmd.height/2, bmd);
        bglife.anchor.set(0.5);
        UIgroup.add(bglife);

        bmd = createBMD(154, 24, "#2af20c");
        var widthLife = new Phaser.Rectangle(0, 0, bmd.width, bmd.height);
        totalLife = bmd.width;
        life = this.game.add.sprite(bglife.x - (bglife.width / 2 - 2), bglife.y + 2, bmd);
        life.anchor.y = 0.5;
        life.cropEnabled = true;   
        UIgroup.add(life);
        game.world.bringToTop(UIgroup);

        socketConfig();
    }


    function update() {

        var anim = "idle";
        var directionX = 0;
        var directionY = 0;

        if (cursors.left.isDown) {
            anim = 'walkLeft';
            directionX = -1;
        }
        if (cursors.right.isDown) {
            anim = 'walkRight';
            directionX = 1;
        }

        if (cursors.up.isDown) {
            anim = 'walkLeft';
            directionY = -1;
        }
        if (cursors.down.isDown) {
            anim = 'walkLeft';
            directionY = 1;
        }

        if (directionX != 0 || directionY != 0) {
            var data = {
                name : mainData.myself.name,
                directionX : directionX,
                directionY : directionY,
                anim : anim,
                speed : mainData.myself.speed
            };
            socket.emit('playerMove', data);   
        }   

        else if (directionX == 0 && directionY == 0) {
            var data = {
                name : mainData.myself.name, 
                directionX : directionX,
                directionY : directionY,
                anim : anim,
                speed : 0
            };
            socket.emit('playerMove', data);
        }

        mainData.playersGroup.sort('y', Phaser.Group.SORT_ASCENDING);  

        key = game.input.keyboard.addKey(Phaser.Keyboard.A);
        key.onUp.add(cropHealth, this);

        // var canCroup = false;
        // if (cursors.left.isDown) {
        //     canCroup = true;
        // };

        // if (canCroup) {
        //     cropHealth(0.05);
        // }

    }

    function render() {
    
    }
    function cropHealth (demage) {
        demage = 0.05;
        var x = life.x;
        var y = life.y;
        var w = life.width;
        var h = life.height;
        var cropW = w - (demage * totalLife);
        var cropRect = new Phaser.Rectangle(0, 0, cropW, h);
        life.crop(cropRect);
     
    }

    function toggleFullscreen () {
        window.game.scale.startFullScreen(false);
    }

    function pressButtonA () {
        console.log("button A");
    }
    function pressButtonB () {
        console.log("button B");
    }

    return gameplay;
}