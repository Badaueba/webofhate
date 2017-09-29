var createBMD = require("../graphicHelpers/createBMD");
var mainData = require('../main/data'); 
/*
    bmdWidth : largura do health
    bmdHeight : altura do health 
    x : x onde health será renderizado
    y : y onde health será renderizado
    group : group de UI da phaser onde será armezando
*/
module.exports = function (bmdWidth, bmdHeight, x, y, group) {
    var game = mainData.game;
    
    var bgBMD = createBMD(bmdWidth, bmdHeight, "#4d394b");
    var bgSprite = game.add.sprite(x + (bmdWidth / 2), bmdHeight/2, bgBMD);
    bgSprite.anchor.set(0.5);
    group.add(bgSprite);
    
    var barBMD = createBMD(bmdWidth -6, bmdHeight -6, "#2af20c");
    var barSprite = game.add.sprite(x + (bmdWidth / 2), bmdHeight/ 2, barBMD);
    barSprite.anchor.set(0.5);
    group.add(barSprite);
    
    return {
        bmd : barBMD,
        bgSprite : bgSprite ,
        barSprite : barSprite
    };
};