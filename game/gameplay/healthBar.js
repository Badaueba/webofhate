var createBMD = require("../graphicHelpers/createBMD");
var mainData = require('../main/data'); 
/*
    bmdWidth : largura do health
    bmdHeight : altura do health 
    x : x onde health será renderizado
    y : y onde health será renderizado
    group : group de UI da phaser onde será armezando
    bg : criar background sprite ou não
*/
module.exports = function (bmdWidth, bmdHeight, x, y, group, bg) {
    var game = mainData.game;
    
    console.log("group", group);
    
    if (bg) {
        var bgBMD = createBMD(bmdWidth, bmdHeight, "#4d394b");
        var bgSprite = game.add.sprite(x + bmdWidth / 2, y + bmdHeight/2, bgBMD);
        bgSprite.anchor.set(0.5);
        group.add(bgSprite);    
    }
    
    var barBMD = createBMD(bmdWidth -6, bmdHeight -6, "#2af20c");
    var barSprite = game.add.sprite(x + 3, y +  3, barBMD);
    group.add(barSprite);
    
    return {
        bmd : barBMD,
        bgSprite : bgSprite || null,
        barSprite : barSprite
    };
};