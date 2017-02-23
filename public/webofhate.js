(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function () {

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
        group = game.add.group();
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


        socket.on("connect", function (){
            console.log("im connected");
        });

        socket.emit("join", window.game.myPlayer);

        socket.on("list_of_players", function (data) {
            console.log('list_of_players', data);
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

        socket.on("movementEvent", movementEvent);

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
        // myPlayer = group.create(randX, randY, game.myPlayer.character);
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

    }

    function createPlayer(data) {
        var playerClass = window.game.players[data.character];
        var newPlayer = group.create(200, 200, data.character);
        newPlayer.name = data.name;
        newPlayer.direction = 1;
        newPlayer.orientation = "walkRight";
        newPlayer.animations.add("walkRight", playerClass.animations.walkRight);
        newPlayer.animations.add("walkLeft", playerClass.animations.walkLeft);
        newPlayer.animations.add("idle", playerClass.animations.idle );
        players.push(newPlayer);

        if (data.name === game.myPlayer.name) {
            myPlayer = newPlayer;
            myPlayer.goingRight = false;
            myPlayer.goingLeft = false;
            game.camera.follow(myPlayer);
            game.camera.x = myPlayer.x;
            game.camera.y = myPlayer.y;
            console.log(newPlayer);
        }
        group.sort();
        console.log('players', players);    
    }


    function pressButtonA () {
        console.log("button A");
    }
    function pressButtonB () {
        console.log("button B");
    }

    function update() {
        var orientation;
        var direction = 1;  
        //desktop
        //LEFT
        if (cursors.left.isDown) {
            myPlayer.goingLeft = true;
            direction = -1;
        }
        else myPlayer.goingLeft = false;

        if (cursors.right.isDown) {
            myPlayer.goingRight = true;
            direction = 1;
        }
        else myPlayer.goingRight = false;

        if (cursors.up.isDown) {
            myPlayer.goingUp = true;
        }
        else myPlayer.goingUp = false;

        if (cursors.down.isDown) {
            myPlayer.goingDown = true;
        }
        else myPlayer.goingDown = false;

        //MOVES, ANIM

        if (!myPlayer.goingLeft && !myPlayer.goingRight && !myPlayer.goingDown && !myPlayer.goingUp)
            // myPlayer.animations.play("idle", 8, true);
            myPlayer.goingDown = myPlayer.goingDown;
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

        updateMoves();
        // group.sort('y', Phaser.Group.SORT_ASCENDING);
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
        game.debug.text('x: ' + myPlayer.x, 10, 20);
        game.debug.text('y: ' + myPlayer.y, 10, 40);
    }
    function toggleFullscreen () {
        window.game.scale.startFullScreen(false);
    }

    function join() {
        socket.emit("join", {});
    }

    return Gameplay;
}
},{}],2:[function(require,module,exports){
module.exports = {
    myself : {},
    game : {},
    
    classes : {
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
}
},{}],3:[function(require,module,exports){
var data = require('./data.js');

module.exports = function () {
    var game = data.game;
    var home = {
        preload : preload,
        create : create,
        auth : auth,
    };

    function preload () {
        game.load.image('signin_button', './assets/sprites/signin_button.png');
    }

    function create () {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        this.scale.forceOrientation(true, false);
        var signin_button =
            this.add.button(game.width / 2 -100, game.height/2 - 50, 'signin_button', this.auth, this);
        signin_button.scale.setTo(0.2, 0.2);

    }
    function auth () {
        $('#authModal').modal('show');
    };

    return home;
}

},{"./data.js":2}],4:[function(require,module,exports){
var data = require('./data.js');
var menu = require('../menu/menu.js');
var home = require('./home.js');
var gameplay = require('../gameplay/gameplay.js');

module.exports = function () {

    window.onload = function () {
        data.game = new Phaser.Game( 450 , 450, Phaser.CANVAS, "webofhate");
        data.game.state.add('menu', menu());
        data.game.state.add('home', home());
        data.game.state.add('gameplay', gameplay());
        data.game.state.start("home");
    }   
}



},{"../gameplay/gameplay.js":1,"../menu/menu.js":5,"./data.js":2,"./home.js":3}],5:[function(require,module,exports){
var Gameplay = require('../gameplay/gameplay');
var data = require('../main/data.js');


module.exports = function () {
    var game = window.game;

    var classes = data.classes;

    var Menu = {
        preload : preload,
        create : create,
        update : update,
        selection : selection,
    };

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
        text.x = Math.floor(this.width / 2 - 100);

        var dwightButton = this.add.button(window.game.width / 2 , 200, 'dwight', this.selection, this);
        dwightButton.player = classes.dwight;
        var rooButton = this.add.button(window.game.width / 2 - 90, 200, 'roo', this.selection, this);
        rooButton.player = classes.roo;
    }

    function update () {
        
    }

    function selection(button) {
        var player = button.player;
        if (!game.device.desktop) {
            window.game.scale.startFullScreen(false);
        }
        window.game.players = classes;
        data.myself = player;
        myself.name = window.localStorage.getItem("username");
        window.game.state.start("Gameplay");
    }

    return Menu;
}
},{"../gameplay/gameplay":1,"../main/data.js":2}],6:[function(require,module,exports){
var main = require('./main/main.js');
require('./main/data.js');
require('./gameplay/gameplay.js');
require('./main/home.js');
require('./menu/menu')

main();
},{"./gameplay/gameplay.js":1,"./main/data.js":2,"./main/home.js":3,"./main/main.js":4,"./menu/menu":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnYW1lL2dhbWVwbGF5L2dhbWVwbGF5LmpzIiwiZ2FtZS9tYWluL2RhdGEuanMiLCJnYW1lL21haW4vaG9tZS5qcyIsImdhbWUvbWFpbi9tYWluLmpzIiwiZ2FtZS9tZW51L21lbnUuanMiLCJnYW1lIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdhbWUgPSB3aW5kb3cuZ2FtZTtcbiAgICB2YXIgR2FtZXBsYXkgPSB7XG4gICAgICAgIHByZWxvYWQgOiBwcmVsb2FkLFxuICAgICAgICBjcmVhdGUgOiBjcmVhdGUsXG4gICAgICAgIHVwZGF0ZSA6IHVwZGF0ZSxcbiAgICAgICAgcmVuZGVyIDogcmVuZGVyLFxuICAgICAgICB0b2dnbGVGdWxsc2NyZWVuIDogdG9nZ2xlRnVsbHNjcmVlbixcbiAgICAgICAgcHJlc3NCdXR0b25BIDogcHJlc3NCdXR0b25BLFxuICAgICAgICBwcmVzc0J1dHRvbkIgOiBwcmVzc0J1dHRvbkJcbiAgICB9O1xuXG5cbiAgICB2YXIgbWFwO1xuICAgIHZhciB0aWxlc2V0O1xuICAgIHZhciBsYXllcjtcblxuICAgIHZhciBteVBsYXllcjtcbiAgICB2YXIgcGxheWVycztcblxuICAgIHZhciBncm91cDtcbiAgICB2YXIgb2xkWSA9IDA7XG4gICAgdmFyIGN1cnNvcnM7XG4gICAgdmFyIGxvY3MgPSBbXTtcbiAgICB2YXIgcmFuZFg7XG4gICAgdmFyIHJhbmRZO1xuICAgIHZhciBzb2NrZXQ7XG5cbiAgICBmdW5jdGlvbiBwcmVsb2FkKCkge1xuICAgICAgICBzb2NrZXQgPSBpbygpO1xuICAgICAgICBwbGF5ZXJzID0gW107XG4gICAgICAgIGdyb3VwID0gZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICAgICAgZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZTtcbiAgICAgICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAgICAgLy9tYXBcbiAgICAgICAgZ2FtZS5sb2FkLnRpbGVtYXAoJ2Rlc2VydCcsICdnYW1lL3RpbGVtYXBzL21hcHMvZGVwdGhzb3J0Lmpzb24nLFxuICAgICAgICAgICAgbnVsbCwgUGhhc2VyLlRpbGVtYXAuVElMRURfSlNPTik7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnZ3JvdW5kXzF4MScsICdnYW1lL3RpbGVtYXBzL3RpbGVzL2dyb3VuZF8xeDEucG5nJyk7XG5cbiAgICAgICAgLy9wbGF5ZXJzXG4gICAgICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHdpZ2h0JywgJ2dhbWUvc3ByaXRlcy9kd2lnaHQucG5nJywgODAsIDgwKTtcbiAgICAgICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdyb28nLCAnZ2FtZS9zcHJpdGVzL3Jvby5wbmcnLCA4MCwgODApO1xuICAgICAgICAvL2Z1bGxzY3JlZW5cbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdmdWxsX3NjcmVlbl9pY29uJywgJ2dhbWUvc3ByaXRlcy9mdWxsX3NjcmVlbl9pY29uLnBuZycsIDQwLCA0MCk7XG5cbiAgICAgICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgODAwLDQ1MCk7XG5cbiAgICAgICAgLy9jdXJzb3JzXG4gICAgICAgIGlmICghZ2FtZS5kZXZpY2UuZGVza3RvcCl7XG4gICAgICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3Zqb3lfYmFzZScsICdnYW1lL3Nwcml0ZXMvYmFzZS5wbmcnKTtcbiAgICAgICAgICAgIGdhbWUubG9hZC5pbWFnZSgndmpveV9ib2R5JywgJ2dhbWUvc3ByaXRlcy9ib2R5LnBuZycpO1xuICAgICAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCd2am95X2NhcCcsICdnYW1lL3Nwcml0ZXMvY2FwLnBuZycpO1xuICAgICAgICB9XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYnV0dG9uX2EnLCAnZ2FtZS9zcHJpdGVzL2J1dHRvbl9hLnBuZycpO1xuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2J1dHRvbl9iJywgJ2dhbWUvc3ByaXRlcy9idXR0b25fYi5wbmcnKTtcblxuXG4gICAgICAgIHNvY2tldC5vbihcImNvbm5lY3RcIiwgZnVuY3Rpb24gKCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImltIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0LmVtaXQoXCJqb2luXCIsIHdpbmRvdy5nYW1lLm15UGxheWVyKTtcblxuICAgICAgICBzb2NrZXQub24oXCJsaXN0X29mX3BsYXllcnNcIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsaXN0X29mX3BsYXllcnMnLCBkYXRhKTtcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZVBsYXllcihwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQub24oXCJyZW1vdmVfcGxheWVyXCIsIGZ1bmN0aW9uIChwbGF5ZXJOYW1lKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92aW5nOiBcIiArIHBsYXllck5hbWUpO1xuICAgICAgICAgICAgcGxheWVycy5mb3JFYWNoIChmdW5jdGlvbiAocGxheWVyLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubmFtZSA9PSBwbGF5ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKFwibmV3X3BsYXllclwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJuZXdfcGxheWVyXCIpO1xuICAgICAgICAgICAgY3JlYXRlUGxheWVyKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQub24oXCJtb3ZlbWVudEV2ZW50XCIsIG1vdmVtZW50RXZlbnQpO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlKCkge1xuXG4gICAgICAgIC8vam95c3RpY2tcbiAgICAgICAgLy9wYWRcbiAgICAgICAgLy8gaWYoIWdhbWUuZGV2aWNlLmRlc2t0b3ApIHtcbiAgICAgICAgLy8gICAgIGdhbWUudmpveSA9IGdhbWUucGx1Z2lucy5hZGQoUGhhc2VyLlBsdWdpbi5WSm95KTtcbiAgICAgICAgLy8gICAgIGdhbWUudmpveS5pbnB1dEVuYWJsZSgpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy9jdXJzb3JzXG4gICAgICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICAgICAgLy8gIENyZWF0ZSBvdXIgdGlsZW1hcCB0byB3YWxrIGFyb3VuZFxuICAgICAgICBtYXAgPSBnYW1lLmFkZC50aWxlbWFwKCdkZXNlcnQnKTtcbiAgICAgICAgbWFwLmFkZFRpbGVzZXRJbWFnZSgnZ3JvdW5kXzF4MScpO1xuICAgICAgICBsYXllciA9IG1hcC5jcmVhdGVMYXllcignVGlsZSBMYXllciAxJyk7XG5cbiAgICAgICAgLy8gIFRoaXMgZ3JvdXAgd2lsbCBob2xkIHRoZSBtYWluIHBsYXllciArIGFsbCB0aGUgdHJlZSBzcHJpdGVzIHRvIGRlcHRoIHNvcnQgYWdhaW5zdFxuICAgICAgICAvL1BMQVlFUlxuICAgICAgICAvL3NldCBwbGF5ZXIgc3ByaXRlXG4gICAgICAgIC8vIHJhbmRYID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSAoKSAqIDcwMCk7XG4gICAgICAgIC8vIHJhbmRZID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSAoKSAqIDIwMCk7XG4gICAgICAgIC8vIG15UGxheWVyID0gZ3JvdXAuY3JlYXRlKHJhbmRYLCByYW5kWSwgZ2FtZS5teVBsYXllci5jaGFyYWN0ZXIpO1xuICAgICAgICAvLyBteVBsYXllci5uYW1lID0gd2luZG93LmdhbWUubXlQbGF5ZXIubmFtZTtcbiAgICAgICAgLy8gbXlQbGF5ZXIuZ29pbmdSaWdodCA9IGZhbHNlO1xuICAgICAgICAvLyBteVBsYXllci5nb2luZ0xlZnQgPSBmYWxzZTtcbiAgICAgICAgLy8gdmFyIHdhbGtpbmdSaWdodEFuaW1hdGlvbiA9IG15UGxheWVyLmFuaW1hdGlvbnMuYWRkKFwid2Fsa1JpZ2h0XCIsIGdhbWUubXlQbGF5ZXIuYW5pbWF0aW9ucy53YWxrUmlnaHQpO1xuICAgICAgICAvLyB2YXIgd2Fsa2luZ0xlZnRBbmltYXRpb24gPSBteVBsYXllci5hbmltYXRpb25zLmFkZChcIndhbGtMZWZ0XCIsIGdhbWUubXlQbGF5ZXIuYW5pbWF0aW9ucy53YWxrTGVmdCk7XG4gICAgICAgIC8vIHZhciBpZGxlQW5pbWF0aW9uID0gbXlQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGdhbWUubXlQbGF5ZXIuYW5pbWF0aW9ucy5pZGxlICk7XG5cbiAgICAgICAgLy9DT05GSUdcbiAgICAgICAgdmFyIGZ1bGxzY3JlZW5fYnV0dG9uID0gZ2FtZS5hZGQuYnV0dG9uKCBnYW1lLmNhbWVyYS54ICsgNDAwLCAwLCAnZnVsbF9zY3JlZW5faWNvbicsIHRoaXMudG9nZ2xlRnVsbHNjcmVlbiwgdGhpcyApO1xuICAgICAgICBmdWxsc2NyZWVuX2J1dHRvbi5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgICAgICAgdmFyIGJ1dHRvbkEgPSBnYW1lLmFkZC5idXR0b24oIGdhbWUud2lkdGggLSAxMjAsIGdhbWUuaGVpZ2h0IC00NSwgJ2J1dHRvbl9hJywgdGhpcy5wcmVzc0J1dHRvbkEsIHRoaXMgKTtcbiAgICAgICAgYnV0dG9uQS5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgICAgICAgdmFyIGJ1dHRvbkIgPSBnYW1lLmFkZC5idXR0b24oIGdhbWUud2lkdGggLSA2MCwgZ2FtZS5oZWlnaHQgLTQ1LCAnYnV0dG9uX2InLCB0aGlzLnByZXNzQnV0dG9uQiwgdGhpcyApO1xuICAgICAgICBidXR0b25CLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlUGxheWVyKGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllckNsYXNzID0gd2luZG93LmdhbWUucGxheWVyc1tkYXRhLmNoYXJhY3Rlcl07XG4gICAgICAgIHZhciBuZXdQbGF5ZXIgPSBncm91cC5jcmVhdGUoMjAwLCAyMDAsIGRhdGEuY2hhcmFjdGVyKTtcbiAgICAgICAgbmV3UGxheWVyLm5hbWUgPSBkYXRhLm5hbWU7XG4gICAgICAgIG5ld1BsYXllci5kaXJlY3Rpb24gPSAxO1xuICAgICAgICBuZXdQbGF5ZXIub3JpZW50YXRpb24gPSBcIndhbGtSaWdodFwiO1xuICAgICAgICBuZXdQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoXCJ3YWxrUmlnaHRcIiwgcGxheWVyQ2xhc3MuYW5pbWF0aW9ucy53YWxrUmlnaHQpO1xuICAgICAgICBuZXdQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoXCJ3YWxrTGVmdFwiLCBwbGF5ZXJDbGFzcy5hbmltYXRpb25zLndhbGtMZWZ0KTtcbiAgICAgICAgbmV3UGxheWVyLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBwbGF5ZXJDbGFzcy5hbmltYXRpb25zLmlkbGUgKTtcbiAgICAgICAgcGxheWVycy5wdXNoKG5ld1BsYXllcik7XG5cbiAgICAgICAgaWYgKGRhdGEubmFtZSA9PT0gZ2FtZS5teVBsYXllci5uYW1lKSB7XG4gICAgICAgICAgICBteVBsYXllciA9IG5ld1BsYXllcjtcbiAgICAgICAgICAgIG15UGxheWVyLmdvaW5nUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIG15UGxheWVyLmdvaW5nTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgZ2FtZS5jYW1lcmEuZm9sbG93KG15UGxheWVyKTtcbiAgICAgICAgICAgIGdhbWUuY2FtZXJhLnggPSBteVBsYXllci54O1xuICAgICAgICAgICAgZ2FtZS5jYW1lcmEueSA9IG15UGxheWVyLnk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdQbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGdyb3VwLnNvcnQoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3BsYXllcnMnLCBwbGF5ZXJzKTsgICAgXG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBwcmVzc0J1dHRvbkEgKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImJ1dHRvbiBBXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwcmVzc0J1dHRvbkIgKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImJ1dHRvbiBCXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgdmFyIG9yaWVudGF0aW9uO1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gMTsgIFxuICAgICAgICAvL2Rlc2t0b3BcbiAgICAgICAgLy9MRUZUXG4gICAgICAgIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duKSB7XG4gICAgICAgICAgICBteVBsYXllci5nb2luZ0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBteVBsYXllci5nb2luZ0xlZnQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoY3Vyc29ycy5yaWdodC5pc0Rvd24pIHtcbiAgICAgICAgICAgIG15UGxheWVyLmdvaW5nUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIG15UGxheWVyLmdvaW5nUmlnaHQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoY3Vyc29ycy51cC5pc0Rvd24pIHtcbiAgICAgICAgICAgIG15UGxheWVyLmdvaW5nVXAgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgbXlQbGF5ZXIuZ29pbmdVcCA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKSB7XG4gICAgICAgICAgICBteVBsYXllci5nb2luZ0Rvd24gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgbXlQbGF5ZXIuZ29pbmdEb3duID0gZmFsc2U7XG5cbiAgICAgICAgLy9NT1ZFUywgQU5JTVxuXG4gICAgICAgIGlmICghbXlQbGF5ZXIuZ29pbmdMZWZ0ICYmICFteVBsYXllci5nb2luZ1JpZ2h0ICYmICFteVBsYXllci5nb2luZ0Rvd24gJiYgIW15UGxheWVyLmdvaW5nVXApXG4gICAgICAgICAgICAvLyBteVBsYXllci5hbmltYXRpb25zLnBsYXkoXCJpZGxlXCIsIDgsIHRydWUpO1xuICAgICAgICAgICAgbXlQbGF5ZXIuZ29pbmdEb3duID0gbXlQbGF5ZXIuZ29pbmdEb3duO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vc2VuZCBpbnB1dHMsIGFuaW0uLlxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgbmFtZSA6IG15UGxheWVyLm5hbWUsXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gOiBvcmllbnRhdGlvbixcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gOiBkaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgeCA6IG15UGxheWVyLngsXG4gICAgICAgICAgICAgICAgeSA6IG15UGxheWVyLnksXG4gICAgICAgICAgICAgICAgc3BlZWQgOiBnYW1lLm15UGxheWVyLnNwZWVkXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzb2NrZXQuZW1pdCgncGxheWVyTW92ZScsIGRhdGEpOyAgIFxuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlTW92ZXMoKTtcbiAgICAgICAgLy8gZ3JvdXAuc29ydCgneScsIFBoYXNlci5Hcm91cC5TT1JUX0FTQ0VORElORyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlTW92ZXMgKCkge1xuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgcGxheWVycy5sZW5ndGg7IGluZGV4ICsrKSB7XG4gICAgICAgICAgICB2YXIgcCA9IHBsYXllcnNbaW5kZXhdO1xuICAgICAgICAgICAgcGxheWVyc1tpbmRleF0ueCArPSBwLmRpcmVjdGlvbiAqIHAuc3BlZWQ7XG4gICAgICAgICAgICBwbGF5ZXJzW2luZGV4XS55ICs9IHAuZGlyZWN0aW9uICogcC5zcGVlZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdmVtZW50RXZlbnQgKHBsYXllcikge1xuXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBwbGF5ZXJzLmxlbmd0aDsgaW5kZXggKyspIHtcbiAgICAgICAgICAgIGlmIChwbGF5ZXJzW2luZGV4XS5uYW1lID09IHBsYXllci5uYW1lKXtcbiAgICAgICAgICAgICAgICBwbGF5ZXJzW2luZGV4XS5hbmltYXRpb25zLnBsYXkocGxheWVyLm9yaWVudGF0aW9uKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXJzW2luZGV4XS54ID0gcGxheWVyLng7XG4gICAgICAgICAgICAgICAgcGxheWVyc1tpbmRleF0ueSA9IHBsYXllci55O1xuICAgICAgICAgICAgICAgIHBsYXllcnNbaW5kZXhdLmRpcmVjdGlvbiA9IHBsYXllci5kaXJlY3Rpb247XG4gICAgICAgICAgICAgICAgcGxheWVyc1tpbmRleF0uc2NhbGUueCA9IHBsYXllci5vcmllbnRhdGlvbjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAvLyBnYW1lLmRlYnVnLnRleHQoJ3Igei1kZXB0aDogJyArIHJvby56LCAxMCwgMjApO1xuICAgICAgICAvLyBnYW1lLmRlYnVnLnRleHQoJ2ggei1kZXB0aDogJyArIG15UGxheWVyLnosIDEwLCA0MCk7XG4gICAgICAgIGdhbWUuZGVidWcudGV4dCgneDogJyArIG15UGxheWVyLngsIDEwLCAyMCk7XG4gICAgICAgIGdhbWUuZGVidWcudGV4dCgneTogJyArIG15UGxheWVyLnksIDEwLCA0MCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvZ2dsZUZ1bGxzY3JlZW4gKCkge1xuICAgICAgICB3aW5kb3cuZ2FtZS5zY2FsZS5zdGFydEZ1bGxTY3JlZW4oZmFsc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGpvaW4oKSB7XG4gICAgICAgIHNvY2tldC5lbWl0KFwiam9pblwiLCB7fSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIEdhbWVwbGF5O1xufSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG15c2VsZiA6IHt9LFxuICAgIGdhbWUgOiB7fSxcbiAgICBcbiAgICBjbGFzc2VzIDoge1xuICAgICAgICByb28gOiB7XG4gICAgICAgICAgICBuYW1lIDogJycsXG4gICAgICAgICAgICBjaGFyYWN0ZXIgOiAncm9vJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbnMgOiB7XG4gICAgICAgICAgICAgICAgd2Fsa0xlZnQgOiBbMTgsIDE5LCAyMF0sXG4gICAgICAgICAgICAgICAgd2Fsa1JpZ2h0IDogWzE4LCAxOSwgMjBdLFxuICAgICAgICAgICAgICAgIGlkbGUgOiBbMCwgMSwgMiwgM11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzcGVlZCA6IDNcbiAgICAgICAgfSxcblxuICAgICAgICBkd2lnaHQgOiB7XG4gICAgICAgICAgICBuYW1lIDogJycsXG4gICAgICAgICAgICBjaGFyYWN0ZXIgOiAnZHdpZ2h0JyxcbiAgICAgICAgICAgIGFuaW1hdGlvbnMgOiB7XG4gICAgICAgICAgICAgICAgd2Fsa0xlZnQgOiBbNiwgN10sXG4gICAgICAgICAgICAgICAgd2Fsa1JpZ2h0IDogWzYsIDddLFxuICAgICAgICAgICAgICAgIGlkbGUgOiBbMCwgMSwgMiwgM11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzcGVlZCA6IDEuNVxuICAgICAgICB9XG4gICAgfVxufSIsInZhciBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnYW1lID0gZGF0YS5nYW1lO1xuICAgIHZhciBob21lID0ge1xuICAgICAgICBwcmVsb2FkIDogcHJlbG9hZCxcbiAgICAgICAgY3JlYXRlIDogY3JlYXRlLFxuICAgICAgICBhdXRoIDogYXV0aCxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcHJlbG9hZCAoKSB7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnc2lnbmluX2J1dHRvbicsICcuL2Fzc2V0cy9zcHJpdGVzL3NpZ25pbl9idXR0b24ucG5nJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlICgpIHtcbiAgICAgICAgZ2FtZS5zY2FsZS5mdWxsU2NyZWVuU2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5FWEFDVF9GSVQ7XG4gICAgICAgIHRoaXMuc2NhbGUuZm9yY2VPcmllbnRhdGlvbih0cnVlLCBmYWxzZSk7XG4gICAgICAgIHZhciBzaWduaW5fYnV0dG9uID1cbiAgICAgICAgICAgIHRoaXMuYWRkLmJ1dHRvbihnYW1lLndpZHRoIC8gMiAtMTAwLCBnYW1lLmhlaWdodC8yIC0gNTAsICdzaWduaW5fYnV0dG9uJywgdGhpcy5hdXRoLCB0aGlzKTtcbiAgICAgICAgc2lnbmluX2J1dHRvbi5zY2FsZS5zZXRUbygwLjIsIDAuMik7XG5cbiAgICB9XG4gICAgZnVuY3Rpb24gYXV0aCAoKSB7XG4gICAgICAgICQoJyNhdXRoTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgIH07XG5cbiAgICByZXR1cm4gaG9tZTtcbn1cbiIsInZhciBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyk7XG52YXIgbWVudSA9IHJlcXVpcmUoJy4uL21lbnUvbWVudS5qcycpO1xudmFyIGhvbWUgPSByZXF1aXJlKCcuL2hvbWUuanMnKTtcbnZhciBnYW1lcGxheSA9IHJlcXVpcmUoJy4uL2dhbWVwbGF5L2dhbWVwbGF5LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGF0YS5nYW1lID0gbmV3IFBoYXNlci5HYW1lKCA0NTAgLCA0NTAsIFBoYXNlci5DQU5WQVMsIFwid2Vib2ZoYXRlXCIpO1xuICAgICAgICBkYXRhLmdhbWUuc3RhdGUuYWRkKCdtZW51JywgbWVudSgpKTtcbiAgICAgICAgZGF0YS5nYW1lLnN0YXRlLmFkZCgnaG9tZScsIGhvbWUoKSk7XG4gICAgICAgIGRhdGEuZ2FtZS5zdGF0ZS5hZGQoJ2dhbWVwbGF5JywgZ2FtZXBsYXkoKSk7XG4gICAgICAgIGRhdGEuZ2FtZS5zdGF0ZS5zdGFydChcImhvbWVcIik7XG4gICAgfSAgIFxufVxuXG5cbiIsInZhciBHYW1lcGxheSA9IHJlcXVpcmUoJy4uL2dhbWVwbGF5L2dhbWVwbGF5Jyk7XG52YXIgZGF0YSA9IHJlcXVpcmUoJy4uL21haW4vZGF0YS5qcycpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnYW1lID0gd2luZG93LmdhbWU7XG5cbiAgICB2YXIgY2xhc3NlcyA9IGRhdGEuY2xhc3NlcztcblxuICAgIHZhciBNZW51ID0ge1xuICAgICAgICBwcmVsb2FkIDogcHJlbG9hZCxcbiAgICAgICAgY3JlYXRlIDogY3JlYXRlLFxuICAgICAgICB1cGRhdGUgOiB1cGRhdGUsXG4gICAgICAgIHNlbGVjdGlvbiA6IHNlbGVjdGlvbixcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcHJlbG9hZCAoKSB7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnZHdpZ2h0JywgJ2dhbWUvc3ByaXRlcy9kd2lnaHRfYXZhdGFyLnBuZycpO1xuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3JvbycsICdnYW1lL3Nwcml0ZXMvcm9vX2F2YXRhci5wbmcnKTtcbiAgICB9XG5cbiAgICB2YXIgdGV4dDtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZSAoKSB7XG5cbiAgICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICAgICAgZm9udDogXCJib2xkIDMycHggQXJpYWxcIixcbiAgICAgICAgICAgIGZpbGw6IFwiI2ZmZlwiLFxuICAgICAgICAgICAgYm91bmRzQWxpZ25IOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYm91bmRzQWxpZ25WOiBcIm1pZGRsZVwiXG4gICAgICAgIH07XG4gICAgICAgIHRleHQgPSBnYW1lLmFkZC50ZXh0KDAsIDAsIFwiU2VsZWN0IHlvdXIgY2hhcmFjdGVyXCIsIHN0eWxlKTtcbiAgICAgICAgdGV4dC5zZXRUZXh0Qm91bmRzKDAsIDUwLCA1MDAsIDEwMCk7XG4gICAgICAgIHRleHQueCA9IE1hdGguZmxvb3IodGhpcy53aWR0aCAvIDIgLSAxMDApO1xuXG4gICAgICAgIHZhciBkd2lnaHRCdXR0b24gPSB0aGlzLmFkZC5idXR0b24od2luZG93LmdhbWUud2lkdGggLyAyICwgMjAwLCAnZHdpZ2h0JywgdGhpcy5zZWxlY3Rpb24sIHRoaXMpO1xuICAgICAgICBkd2lnaHRCdXR0b24ucGxheWVyID0gY2xhc3Nlcy5kd2lnaHQ7XG4gICAgICAgIHZhciByb29CdXR0b24gPSB0aGlzLmFkZC5idXR0b24od2luZG93LmdhbWUud2lkdGggLyAyIC0gOTAsIDIwMCwgJ3JvbycsIHRoaXMuc2VsZWN0aW9uLCB0aGlzKTtcbiAgICAgICAgcm9vQnV0dG9uLnBsYXllciA9IGNsYXNzZXMucm9vO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZSAoKSB7XG4gICAgICAgIFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbGVjdGlvbihidXR0b24pIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGJ1dHRvbi5wbGF5ZXI7XG4gICAgICAgIGlmICghZ2FtZS5kZXZpY2UuZGVza3RvcCkge1xuICAgICAgICAgICAgd2luZG93LmdhbWUuc2NhbGUuc3RhcnRGdWxsU2NyZWVuKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzID0gY2xhc3NlcztcbiAgICAgICAgZGF0YS5teXNlbGYgPSBwbGF5ZXI7XG4gICAgICAgIG15c2VsZi5uYW1lID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIik7XG4gICAgICAgIHdpbmRvdy5nYW1lLnN0YXRlLnN0YXJ0KFwiR2FtZXBsYXlcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1lbnU7XG59IiwidmFyIG1haW4gPSByZXF1aXJlKCcuL21haW4vbWFpbi5qcycpO1xucmVxdWlyZSgnLi9tYWluL2RhdGEuanMnKTtcbnJlcXVpcmUoJy4vZ2FtZXBsYXkvZ2FtZXBsYXkuanMnKTtcbnJlcXVpcmUoJy4vbWFpbi9ob21lLmpzJyk7XG5yZXF1aXJlKCcuL21lbnUvbWVudScpXG5cbm1haW4oKTsiXX0=
