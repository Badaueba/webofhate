var createPlayer = require('../createPlayer');

module.exports = function (data) {
    console.log('list', data);
    data.forEach(function (player) {
        createPlayer(player);
    });
}