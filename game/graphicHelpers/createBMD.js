var mainData = require('../main/data');

module.exports = function (w, h, color) {
    var bmd = mainData.game.add.bitmapData(w, h);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, w, h);
    bmd.ctx.fillStyle = color;
    bmd.ctx.fill();
    return bmd;
}