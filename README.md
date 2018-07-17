# pixi-tilemap

[![Build Status](https://travis-ci.org/pixijs/pixi-tilemap.svg?branch=master)](https://travis-ci.org/pixijs/pixi-tilemap)

Library that helps with tilemaps, provide special shaders and canvas fallback. Works only with pixi > 4.2.4

It has some strict limitations connected to its RPGMV legacy: it uses only up to 16 textures of size 1024x1024, and combines them into 4 render textures of 2k size.

When you render the tilemap with other textures, textures will be re-uploaded.

If that limitation is affecting you somehow, either hack it, either help the project by submitting more general solution.

Please use [v3 branch](https://github.com/pixijs/pixi-tilemap/tree/pixiv3) for pixi V3.

Rpgmaker MV - check.

TODO: Tiled, gameofbombs - in progress.

Canvas fallback is 5x slower than vanilla rpgmaker. Webgl version is faster and doesnt use extra textures.

### RPGMaker demo

[webgl](https://pixijs.github.io/pixi-tilemap/): [zoomin](https://pixijs.github.io/pixi-tilemap/?scale=0.6) and [zoomout](https://pixijs.github.io/pixi-tilemap/?scale=1.4)

[retina webgl](https://pixijs.github.io/pixi-tilemap/?resolution=2): [zoomin](https://pixijs.github.io/pixi-tilemap/?resolution=2&scale=0.6) and [zoomout](https://pixijs.github.io/pixi-tilemap/?resolution=2&scale=1.4)

[canvas](https://pixijs.github.io/pixi-tilemap/?canvas)

### Basic demo

[webgl](https://pixijs.github.io/pixi-tilemap/basic.html)

```html
<script src="https://github.com/pixijs/pixi-tilemap/blob/master/src/pixi-tilemap.js"></script>
```

```js
var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

var loader = new PIXI.loaders.Loader();
loader.add('atlas', 'basic/atlas.json');
loader.load(function(loader, resources) {
	var tilemap = new PIXI.tilemap.CompositeRectTileLayer(0, [resources['atlas_image'].texture]);
    var size = 32;
    // bah, im too lazy, i just want to specify filenames from atlas
    for (var i=0;i<7;i++)
        for (var j=0;j<7;j++) {
            tilemap.addFrame("grass.png", i*size, j*size);
            if (i%2==1 && j%2==1)
                tilemap.addFrame("tough.png", i*size, j*size);
        }

    // if you are lawful citizen, please use textures from the loader
    var textures = resources.atlas.textures;
    tilemap.addFrame(textures["brick.png"], 2*size, 2*size);
    tilemap.addFrame(textures["brick_wall.png"], 2*size, 3*size);

    renderer.render(tilemap);
});
```

### More tutorials

[Alan01252 tutorial](https://github.com/Alan01252/pixi-tilemap-tutorial)
