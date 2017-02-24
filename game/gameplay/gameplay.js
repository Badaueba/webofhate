var data;

module.exports = function () {
    data = require('../main/data'); 

    var game = data.game;

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
    var oldY = 0;
    var cursors;
    var locs = [];
    var randX;
    var randY;
    var socket;

    function preload() {
        socket = io();
        players = [];
        
        group = new Phaser.Group(data.game, null, 'playersGroup', true, false, 0);
        data.playersGroup = group;

        game.renderer.renderSession.roundPixels = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //map
        game.load.tilemap('desert', './assets/tilemaps/maps/depthsort.json',
            null, Phaser.Tilemap.TILED_JSON);
        game.load.image('ground_1x1', './assets/tilemaps/tiles/ground_1x1.png');

        //players
        game.load.spritesheet('dwight', './assets/sprites/dwight.png', 80, 80);
        game.load.spritesheet('roo', './assets/sprites/roo.png', 80, 80);
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
            name : data.myself.name,
            character : data.myself.character
        });
        socket.emit('list_of_players');

        // socket.on("remove_player", function (playerName) {
        //     console.log("removing: " + playerName);
        //     players.forEach (function (player, index) {
        //         if (player.name == playerName) {
        //             players.splice(index, 1);
        //         }
        //     });
        // });

        // socket.on("new_player", function (data) {
        //     console.log("new_player");
        //     createPlayer(data);
        // });

        // socket.on("movementEvent", movementEvent);

    }

    function create() {

        //joystick
        //pad
        // if(!game.device.desktop) {
        //     game.vjoy = game.plugins.add(Phaser.Plugin.VJoy);
        //     game.vjoy.inputEnable();
        // }

        //cursors
        cursors = game.input.keyboard.createCursorKeys();
        //  Create our tilemap to walk around
        map = game.add.tilemap('desert');
        map.addTilesetImage('ground_1x1');
        layer = map.createLayer('Tile Layer 1');

        //  This group will hold the main player + all the tree sprites to depth sort against
        //PLAYER
        //set player sprite
        // randX = Math.floor(Math.random () * 700);
        // randY = Math.floor(Math.random () * 200);
        // myPlayer.name = window.game.myPlayer.name;
        // myPlayer.goingRight = false;
        // myPlayer.goingLeft = false;
        // var walkingRightAnimation = myPlayer.animations.add("walkRight", game.myPlayer.animations.walkRight);
        // var walkingLeftAnimation = myPlayer.animations.add("walkLeft", game.myPlayer.animations.walkLeft);
        // var idleAnimation = myPlayer.animations.add("idle", game.myPlayer.animations.idle );

        //CONFIG
        var fullscreen_button = game.add.button( game.camera.x + 400, 0, 'full_screen_icon', this.toggleFullscreen, this );
        fullscreen_button.fixedToCamera = true;
        var buttonA = game.add.button( game.width - 120, game.height -45, 'button_a', this.pressButtonA, this );
        buttonA.fixedToCamera = true;
        var buttonB = game.add.button( game.width - 60, game.height -45, 'button_b', this.pressButtonB, this );
        buttonB.fixedToCamera = true;

        socketConfig();
    }


    function update() {
        // var orientation;
        // var direction = 1;  
        // //desktop
        // //LEFT
        // if (cursors.left.isDown) {
        //     myPlayer.goingLeft = true;
        //     direction = -1;
        // }
        // else myPlayer.goingLeft = false;

        // if (cursors.right.isDown) {
        //     myPlayer.goingRight = true;
        //     direction = 1;
        // }
        // else myPlayer.goingRight = false;

        // if (cursors.up.isDown) {
        //     myPlayer.goingUp = true;
        // }
        // else myPlayer.goingUp = false;

        // if (cursors.down.isDown) {
        //     myPlayer.goingDown = true;
        // }
        // else myPlayer.goingDown = false;

        // //MOVES, ANIM

        // if (!myPlayer.goingLeft && !myPlayer.goingRight && !myPlayer.goingDown && !myPlayer.goingUp)
        //     // myPlayer.animations.play("idle", 8, true);
        //     myPlayer.goingDown = myPlayer.goingDown;
        // else {
        //     //send inputs, anim..
        //     var data = {
        //         name : myPlayer.name,
        //         orientation : orientation,
        //         direction : direction,
        //         x : myPlayer.x,
        //         y : myPlayer.y,
        //         speed : game.myPlayer.speed
        //     };

        //     socket.emit('playerMove', data);   
        // }

        // updateMoves();
        data.playersGroup.sort('y', Phaser.Group.SORT_ASCENDING);
    }

    function updateMoves () {
        for (var index = 0; index < players.length; index ++) {
            var p = players[index];
            players[index].x += p.direction * p.speed;
            players[index].y += p.direction * p.speed;
        }
    }

    function movementEvent (player) {

        for (var index = 0; index < players.length; index ++) {
            if (players[index].name == player.name){
                players[index].animations.play(player.orientation);
                players[index].x = player.x;
                players[index].y = player.y;
                players[index].direction = player.direction;
                players[index].scale.x = player.orientation;
                return;
            }

        }
    }


    function render() {
        // game.debug.text('r z-depth: ' + roo.z, 10, 20);
        // game.debug.text('h z-depth: ' + myPlayer.z, 10, 40);
        // game.debug.text('x: ' + myPlayer.x, 10, 20);
        // game.debug.text('y: ' + myPlayer.y, 10, 40);
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