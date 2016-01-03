/**
 * Created by Liza on 30.10.2015.
 */


var renderer;
var rpgMakerLoader = requireRpgMaker();
var stage = null;
var tilemap = null;

var scale = +(getOptionValue("scale") || 1);

function resizeTilemap() {
    if (!tilemap) return;
    tilemap.width = (renderer.width + 2*tilemap._margin) * scale;
    tilemap.height = (renderer.height + 2*tilemap._margin) * scale;
    stage.scale.x = 1.0/scale;
    stage.scale.y = 1.0/scale;
    stage.filterArea = new PIXI.Rectangle(0, 0, renderer.width*scale, renderer.height*scale);
}

function resize() {
    renderer.resize(window.innerWidth, window.innerHeight);
    resizeTilemap();
}

function getOptionValue(name) {
    var params = location.search.slice(1).split('&');
    for (var i=0;i<params.length;i++) {
        if (params[i].substring(0, name.length) === name && params[i][name.length] === "=") {
            return params[i].substring(name.length+1);
        }
    };
    return null;
};

function isOptionValid(name) {
    return location.search.slice(1).split('&').indexOf(name) >= 0;
};

function setupView() {
    var backCanvas = document.querySelector('#backCanvas');

    if (isOptionValid('canvas'))
        renderer = new PIXI.CanvasRenderer(backCanvas.width, backCanvas.height, {view: backCanvas, resolution: 1, antialias: 1});
    else
        renderer = PIXI.autoDetectRenderer(backCanvas.width, backCanvas.height, {view: backCanvas, resolution: 1, antialias: 1});
    resize();
    window.addEventListener('resize', resize)
}

function setupGame() {
    requestAnimationFrame(update);
    rpgMakerLoader.load('Map001', function(err, map) {
        if (err) return;
        tilemap = map;
        tilemap.roundPixels = (scale==1);
        stage = new PIXI.Container();
        stage.addChild(tilemap);
        resizeTilemap();
    });
}

//window.requestAnimationFrame = function(cb) {
//    return setTimeout(cb, 500);
//}

var dt = 0, last = 0, animTime = 0;

function update() {
    var now = Date.now();
    var dt = Math.min(1000, now-last);
    dt/=1000;
    last = now;

    if (stage) {
        tilemap.update();

        var dt2 = dt;
        var w1 = tilemap._tileWidth * tilemap._mapWidth;
        var h1 = tilemap._tileHeight * tilemap._mapHeight;
        var x1 = tilemap.origin.x, y1 = tilemap.origin.y;
        var x2=0, y2=0;
        for (var i=0;i<30;i++) {
            var at2 = animTime + dt2;
            x2 = Math.max(0, w1 - renderer.width * scale) * (Math.cos(at2*0.5) + 1)/2;
            y2 = Math.max(0, h1 - renderer.height * scale) * (Math.sin(at2*0.4) + 1)/2;
            var d = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
            if (d>5*scale) {
                dt2 = dt2 / (d/5/scale);
            } else break;
        }
        animTime += dt2;
        tilemap.origin.x = x2;
        tilemap.origin.y = y2;
        renderer.render(stage);
    }
    requestAnimationFrame(update);
}


window.go = function () {
    setupView();
    setupGame();
}