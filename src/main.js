/**
 * Created by Liza on 30.10.2015.
 */


var renderer;
var rpgMakerLoader = requireRpgMaker();
var stage = null;

function resize() {
    renderer.resize(window.innerWidth, window.innerHeight);
    if (stage) {
        stage.width = renderer.width + 2 * stage._margin;
        stage.height = renderer.height + 2 * stage._margin;
    }
}

function isOptionValid(name) {
    return location.search.slice(1).split('&').contains(name);
};

function setupView() {
    var backCanvas = document.querySelector('#backCanvas');

    if (isOptionValid('canvas'))
        renderer = new PIXI.CanvasRenderer(backCanvas.width, backCanvas.height, {view: backCanvas, resolution: 1});
    else
        renderer = PIXI.autoDetectRenderer(backCanvas.width, backCanvas.height, {view: backCanvas, resolution: 1});

    if (Utils.isOptionValid('canvas')) {
        return 'canvas';

    resize();
    window.addEventListener('resize', resize)
}

function setupGame() {
    requestAnimationFrame(update);
    rpgMakerLoader.load('Map001', function(err, map) {
        if (err) return;
        stage = map;
        stage.width = renderer.width + 2 * stage._margin;
        stage.height = renderer.height + 2 * stage._margin;
    })
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
        stage.update();

        var dt2 = dt;
        var w1 = stage._tileWidth * stage._mapWidth;
        var h1 = stage._tileHeight * stage._mapHeight;
        var x1 = stage.origin.x, y1 = stage.origin.y;
        var x2=0, y2=0;
        for (var i=0;i<30;i++) {
            var at2 = animTime + dt2;
            x2 = Math.max(0, w1 - renderer.width) * (Math.cos(at2*0.5) + 1)/2;
            y2 = Math.max(0, h1 - renderer.height) * (Math.sin(at2*0.4) + 1)/2;
            var d = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
            if (d>5) {
                dt2 = dt2 / (d/5);
            } else break;
        }
        animTime += dt2;
        stage.origin.x = x2;
        stage.origin.y = y2;
        renderer.render(stage);
    }
    requestAnimationFrame(update);
}


window.go = function () {
    setupView();
    setupGame();
}