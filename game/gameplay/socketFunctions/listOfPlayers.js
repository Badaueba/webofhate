var createPlayer = require('../createPlayer');

module.exports = function (data) {
    console.log('list of players', data);
    data.forEach(function (player) {
        createPlayer(player);
    });
}