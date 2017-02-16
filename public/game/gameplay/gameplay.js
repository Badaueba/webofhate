var game = window.game;
var Gameplay = {
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

    game.renderer.renderSession.roundPixels = true;
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //map
    game.load.tilemap('desert', 'game/tilemaps/maps/depthsort.json',
        null, Phaser.Tilemap.TILED_JSON);
    game.load.image('ground_1x1', 'game/tilemaps/tiles/ground_1x1.png');

    //players
    game.load.spritesheet('dwight', 'game/sprites/dwight.png', 80, 80);
    game.load.spritesheet('roo', 'game/sprites/roo.png', 80, 80);
    //fullscreen
    game.load.image('full_screen_icon', 'game/sprites/full_screen_icon.png', 40, 40);

    game.world.setBounds(0, 0, 800,450);

    //cursors
    if (!game.device.desktop){
        game.load.image('vjoy_base', 'game/sprites/base.png');
        game.load.image('vjoy_body', 'game/sprites/body.png');
        game.load.image('vjoy_cap', 'game/sprites/cap.png');
    }
    game.load.image('button_a', 'game/sprites/button_a.png');
    game.load.image('button_b', 'game/sprites/button_b.png');

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
    group = game.add.group();
    //set player sprite
    randX = Math.floor(Math.random () * 700);
    randY = Math.floor(Math.random () * 200);
    myPlayer = group.create(randX, randY, game.myPlayer.character);
    myPlayer.name = window.game.myPlayer.name;
    myPlayer.goingRight = false;
    myPlayer.goingLeft = false;
    var walkingRightAnimation = myPlayer.animations.add("walkRight", game.myPlayer.animations.walkRight);
    var walkingLeftAnimation = myPlayer.animations.add("walkLeft", game.myPlayer.animations.walkLeft);
    var idleAnimation = myPlayer.animations.add("idle", game.myPlayer.animations.idle );
    game.camera.follow(myPlayer);
    game.camera.x = myPlayer.x;
    game.camera.y = myPlayer.y;
    group.sort();

    //CONFIG
    var fullscreen_button = game.add.button( game.camera.x + 400, 0, 'full_screen_icon', this.toggleFullscreen, this );
    fullscreen_button.fixedToCamera = true;
    var buttonA = game.add.button( game.width - 120, game.height -45, 'button_a', this.pressButtonA, this );
    buttonA.fixedToCamera = true;
    var buttonB = game.add.button( game.width - 60, game.height -45, 'button_b', this.pressButtonB, this );
    buttonB.fixedToCamera = true;

    socket.on("connect", function (){
        console.log("im connected");
    });

    socket.emit("join", window.game.myPlayer);

    socket.on("list_of_players", function (data) {
        console.log('list_of_players');
        data.forEach(function (p) {
            createPlayer(p);
        });
    });

    socket.on("remove_player", function (playerName) {
        console.log("removing: " + playerName);
        players.forEach (function (player, index) {
            if (player.name == playerName) {
                players.splice(index, 1);
            }
        });
    });

    socket.on("new_player", function (data) {
        console.log("new_player");
        createPlayer(data);
    });

    socket.on("aplyMovement", movePlayers);

}

function createPlayer(data) {
    if (data.name !== myPlayer.name) {
        var playerClass = window.game.players[data.character];
        var newPlayer = group.create(200, 200, data.character);
        newPlayer.name = data.name;
        newPlayer.walkingRightAnimation = newPlayer.animations.add("walkRight", playerClass.animations.walkRight);
        var walkingLeftAnimation = newPlayer.animations.add("walkLeft", playerClass.animations.walkLeft);
        var idleAnimation = newPlayer.animations.add("idle", playerClass.animations.idle );
        players.push(newPlayer);
        console.log('players', players);    
    } 
}

function pressButtonA () {
    console.log("button A");
}
function pressButtonB () {
    console.log("button B");
}

function update() {
    var orientation;
    var direction = 0;  

    //mobile
    if (!game.device.desktop) {
        cursors = game.vjoy.cursors;
        if (cursors.left) myPlayer.goingLeft = true;
        else myPlayer.goingLeft = false;
        if (cursors.right) myPlayer.goingRight = true;
        else myPlayer.goingRight = false;
        if (cursors.up) myPlayer.goingUp = true;
        else myPlayer.goingUp = false;
        if (cursors.down) myPlayer.goingDown = true;
        else myPlayer.goingDown = false;

    }
    //desktop
    else {
        //LEFT
        if (cursors.left.isDown) myPlayer.goingLeft = true;
        else myPlayer.goingLeft = false;
        if (cursors.right.isDown) myPlayer.goingRight = true;
        else myPlayer.goingRight = false;
        if (cursors.up.isDown) myPlayer.goingUp = true;
        else myPlayer.goingUp = false;
        if (cursors.down.isDown) myPlayer.goingDown = true;
        else myPlayer.goingDown = false;

    }

    //MOVES, ANIM
    if (myPlayer.goingLeft){
        myPlayer.animations.play("walkLeft", 4, true);
        orientation = "walkLeft";
        direction = -1;
        myPlayer.scale.x = direction;
        myPlayer.x += game.myPlayer.speed * direction;
    }
    if (myPlayer.goingRight){
        myPlayer.animations.play("walkLeft", 4, true);
        orientation = "walkLeft";
        myPlayer.scale.x = 1;
        direction = 1;
        myPlayer.x += game.myPlayer.speed * direction;
    }


    if (myPlayer.goingDown) {
        myPlayer.animations.play("walkLeft", 4, true);
        orientation = "walkLeft";
        direction = 1;
        myPlayer.y += game.myPlayer.speed * direction;
    }
    if (myPlayer.goingUp) {
        myPlayer.animations.play("walkLeft", 4, true);
        orientation = "walkLeft";
        direction = -1
        myPlayer.y += game.myPlayer.speed * direction;
    }

    if (!myPlayer.goingLeft && !myPlayer.goingRight && !myPlayer.goingDown && !myPlayer.goingUp)
        myPlayer.animations.play("idle", 8, true);
    else {
        //send inputs, anim..
        var data = {
            name : myPlayer.name,
            orientation : orientation,
            direction : direction,
            x : myPlayer.x,
            y : myPlayer.y,
            speed : game.myPlayer.speed
        };

        socket.emit('playerMove', data);   
    }

    group.sort('y', Phaser.Group.SORT_ASCENDING);

    

}

function movePlayers (player) {

    // console.log('movePlayers', player)
    players.forEach( function(p, index) {
        if (p.name == player.name){
            console.log('p', p);
            players[index].animations.play(player.orientation);
            players[index].x = player.x;
            players[index].y += player.y;
            if (player.orientation == 'walkLeft' || player.orientation == "walkRight")
                players[index].scale.x = player.orientation; 
        }

    });
}

function render() {
    // game.debug.text('r z-depth: ' + roo.z, 10, 20);
    // game.debug.text('h z-depth: ' + myPlayer.z, 10, 40);
    game.debug.text('spawn x: ' + randX, 10, 20);
    game.debug.text('spawn y: ' + randY, 10, 40);
}
function toggleFullscreen () {
    window.game.scale.startFullScreen(false);
}

function join() {
    socket.emit("join", {});
}
