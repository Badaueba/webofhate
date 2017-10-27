module.exports = function cropHealth (demage, sprite, totalLife) {
    var w = sprite.width;
    var h = sprite.height;
    var cropW = w - (demage * totalLife);
    var cropRect = new Phaser.Rectangle(0, 0, cropW, h);
    sprite.crop(cropRect);
    return sprite
}
