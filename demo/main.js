/* eslint-disable */
/**
 * Created by Liza on 30.10.2015.
 */

let _renderer;
const rpgMakerLoader = requireRpgMaker();
let stage = null;
let tilemap = null;

const scale = Number(getOptionValue('scale') || 1);
const resolution = Number(getOptionValue('resolution') || window.devicePixelRatio);
const ratio = window.devicePixelRatio / resolution;

PIXI.tilemap.Constant.boundCountPerBuffer = 4;
// or
// PIXI.tilemap.Constant.maxTextures = 16;
// both are fine for RMMV

function resizeTilemap()
{
    if (!tilemap) return;
    tilemap.width = (_renderer.width + 2 * tilemap._margin) * scale;
    tilemap.height = (_renderer.height + 2 * tilemap._margin) * scale;
    stage.scale.x = 1.0 / scale;
    stage.scale.y = 1.0 / scale;
    stage.filterArea = new PIXI.Rectangle(0, 0, _renderer.width * scale, _renderer.height * scale);
}

function resize()
{
    const r = ratio;

    _renderer.resize(window.innerWidth * r | 0, window.innerHeight * r | 0);
    resizeTilemap();
}

function getOptionValue(name)
{
    const params = location.search.slice(1).split('&');

    for (let i = 0; i < params.length; i++)
    {
        if (params[i].substring(0, name.length) === name && params[i][name.length] === '=')
        {
            return params[i].substring(name.length + 1);
        }
    }

    return null;
}

function isOptionValid(name)
{
    return location.search.slice(1).split('&').indexOf(name) >= 0;
}

function setupView()
{
    const backCanvas = document.querySelector('#backCanvas');

    if (isOptionValid('canvas'))
    { _renderer = new PIXI.CanvasRenderer({ width: backCanvas.width, height: backCanvas.height, view: backCanvas, resolution, antialias: 1, autoresize: true }); }
    else
    { _renderer = PIXI.autoDetectRenderer({ width: backCanvas.width, height: backCanvas.height, view: backCanvas, resolution, antialias: 1, autoresize: true }); }
    resize();
    window.addEventListener('resize', resize);
}

function setupGame()
{
    requestAnimationFrame(update);
    rpgMakerLoader.load('Map001', function (err, map)
    {
        if (err) return;
        tilemap = map;
        tilemap.roundPixels = (scale == 1);
        stage = new PIXI.Container();
        stage.addChild(tilemap);
        resizeTilemap();
    });
}

// window.requestAnimationFrame = function(cb) {
//    return setTimeout(cb, 500);
// }

const dt = 0; let last = 0; let
    animTime = 0;

function update()
{
    const now = Date.now();
    let dt = Math.min(1000, now - last);

    dt /= 1000;
    last = now;

    if (stage)
    {
        tilemap.update();

        let dt2 = dt;
        const w1 = tilemap._tileWidth * tilemap._mapWidth;
        const h1 = tilemap._tileHeight * tilemap._mapHeight;
        const x1 = tilemap.origin.x; const
            y1 = tilemap.origin.y;
        let x2 = 0; let
            y2 = 0;

        for (let i = 0; i < 30; i++)
        {
            const at2 = animTime + dt2;

            x2 = Math.max(0, w1 - _renderer.width * scale / resolution) * (Math.cos(at2 * 0.5) + 1) / 2;
            y2 = Math.max(0, h1 - _renderer.height * scale / resolution) * (Math.sin(at2 * 0.4) + 1) / 2;
            const d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

            if (d > 5 * scale / resolution)
            {
                dt2 = dt2 / (d / 5 / scale / ratio);
            }
            else break;
        }
        animTime += dt2;
        tilemap.origin.x = x2;
        tilemap.origin.y = y2;
        _renderer.render(stage);
        // WebGL fix for some devices
        if (_renderer.gl)
        {
            _renderer.gl.flush();
        }
    }
    requestAnimationFrame(update);
}

window.go = function ()
{
    setupView();
    setupGame();
};
