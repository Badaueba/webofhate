var createPlayer = require('../createPlayer');

module.exports = function (player) {
    console.log('a new wild player appear', player);
    createPlayer(player)
}