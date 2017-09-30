/**
 * Created by Liza on 30.10.2015.
 */


var _renderer;
var rpgMakerLoader = requireRpgMaker();
var stage = null;
var tilemap = null;

var scale = +(getOptionValue('scale') || 1);
var resolution = +(getOptionValue('resolution') || window.devicePixelRatio);
var ratio = window.devicePixelRatio / resolution;

function resizeTilemap() {
    if (!tilemap) return;
    tilemap.width = (_renderer.width + 2*tilemap._margin) * scale;
    tilemap.height = (_renderer.height + 2*tilemap._margin) * scale;
    stage.scale.x = 1.0/scale;
    stage.scale.y = 1.0/scale;
    stage.filterArea = new PIXI.Rectangle(0, 0, _renderer.width*scale, _renderer.height*scale);
}

function resize() {
    var r = ratio;
    _renderer.resize(window.innerWidth * r | 0, window.innerHeight * r | 0);
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
        _renderer = new PIXI.CanvasRenderer(backCanvas.width, backCanvas.height, {view: backCanvas, resolution: resolution, antialias: 1, autoresize: true});
    else
        _renderer = PIXI.autoDetectRenderer(backCanvas.width, backCanvas.height, {view: backCanvas, resolution: resolution, antialias: 1, autoresize: true});
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
            x2 = Math.max(0, w1 - _renderer.width * scale / resolution) * (Math.cos(at2*0.5) + 1)/2;
            y2 = Math.max(0, h1 - _renderer.height * scale / resolution) * (Math.sin(at2*0.4) + 1)/2;
            var d = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
            if (d>5*scale / resolution) {
                dt2 = dt2 / (d / 5 / scale / ratio );
            } else break;
        }
        animTime += dt2;
        tilemap.origin.x = x2;
        tilemap.origin.y = y2;
        _renderer.render(stage);
        _renderer.gl.flush();
    }
    requestAnimationFrame(update);
}


window.go = function () {
    setupView();
    setupGame();
}