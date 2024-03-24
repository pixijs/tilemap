/* eslint-disable */
/**
 * Created by Liza on 30.10.2015.
 */

function getOptionValue(name) {
    var params = location.search.slice(1).split('&');
    for (var i=0;i<params.length;i++) {
        if (params[i].substring(0, name.length) === name && params[i][name.length] === "=") {
            return params[i].substring(name.length+1);
        }
    }
    return null;
}

var _renderer;
var rpgMakerLoader = requireRpgMaker();
var stage = null;
var tilemap = null;

var scale = +(getOptionValue('scale') || 1);
var resolution = +(getOptionValue('resolution') || window.devicePixelRatio);
var ratio = window.devicePixelRatio / resolution;

PIXI.tilemap.Constant.boundCountPerBuffer = 4;

window.go = async () => {
    // or
// PIXI.tilemap.Constant.maxTextures = 16;
// both are fine for RMMV

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

    function isOptionValid(name) {
        return location.search.slice(1).split('&').indexOf(name) >= 0;
    }

    const app = new PIXI.Application();

    await app.init({
        preference: isOptionValid('webgpu') ? 'webgpu' : 'webgl',
        hello: true,
        resizeTo: window
    });

    const _renderer = app.renderer;

    document.body.appendChild(app.canvas);

    const tilemap = await rpgMakerLoader.load('Map001');
    tilemap.roundPixels = (scale === 1);
    stage = app.stage;
    stage.addChild(tilemap);
    resizeTilemap();

    app.ticker.add(update);

    var dt = 0, last = 0, animTime = 0;

    function update() {
        var now = Date.now();
        var dt = Math.min(1000, now-last);
        dt/=1000;
        last = now;

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

        tilemap.updateTransformTick()
    }
}
