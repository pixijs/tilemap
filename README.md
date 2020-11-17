# pixi-tilemap

[![Build Status](https://travis-ci.org/pixijs/pixi-tilemap.svg?branch=master)](https://travis-ci.org/pixijs/pixi-tilemap)

<p align="center">
<img src="https://i.imgur.com/hfoiBRk.png" width="1280px" />
<p/>

Library that helps with tilemaps, provide special shaders and canvas fallback. Works with pixi >= 5.0.4

## Plugin Registration (Breaking Change!)

You have to register the plugin before you can use it.  
Since the CanvasRenderer is only supported by `pixi-legacy` you have to register
the renderer which fits your needs by yourself.

### umd

**Note** used by the examples

```js
// the plugin is exposed to the global scope via `pixi_tilemap`
PIXI.Renderer.registerPlugin('tilemap', pixi_tilemap.TileRenderer);

const renderer = PIXI.autoDetectRenderer({ width: 800, height: 600 });
// ....
```

### CommonJS (require)

**Note** currently not tested, but should work.

```js
const { Renderer } = require('pixi.js');
const { TileRenderer } = require('pixi-tilemap');

// the plugin must be registered before a pixi application is created
Renderer.registerPlugin('tilemap', TileRenderer);

const renderer = autoDetectRenderer({ width: 800, height: 600 });
// ....
```

### ES Modules (import)

```js
import { Renderer } from 'pixi.js';
import { TileRenderer } from 'pixi-tilemap';

// the plugin must be registered before a pixi application is created
Renderer.registerPlugin('tilemap', TileRenderer);

const renderer = autoDetectRenderer({ width: 800, height: 600 });
// ....
```

## Type of builds (**Important!**)

This package supports all commonly used js module formats.

**Note**:

- the package is set to be a commonjs package by default. See [package.json#type](https://nodejs.org/api/packages.html#packages_type)
- The [package.json#exports](https://nodejs.org/api/packages.html#packages_exports) is used to aid the module resolution in finding the correct entry point

```json
// package.json#exports
{
  "exports": {
    "import": "./dist/esm/index.js",
    "require": "./dist/index.js",
    "browser": "./dist/pixi-tilemap.umd.production.min.js"
  }
}
```

### umd (production build / minified)

```html
<script src="dist/pixi-tilemap.umd.production.min.js"></script>
```

### umd (development build)

```html
<script src="dist/pixi-tilemap.umd.development.js"></script>
```

### commonjs

```js
const pixiTilemap = require('pixi-tilemap');
// or
const { TileRenderer } = require('pixi-tilemap');

// depending on your current NODE_ENV the dev or prod bundle is required
```

### esm

```js
import * as pixiTilemap from 'pixi-tilemap';
// or
import { TileRenderer } from 'pixi-tilemap';
```

## Multi-texture Configuration (**Important!**) :page_facing_up:

Please specify how many base textures do you want to use. That's the default:

```js
PIXI.tilemap.Constant.maxTextures = 4;
```

That means, if you use 5th baseTexture, compositeRectTileLayer will move it to second RectTileLayer and all tiles of that texture will go on different Z level!

Specify bigger `maxTextures` if you want everything to be on the same Z.

```js
PIXI.tilemap.Constant.maxTextures = 16;
```

Not every device does have 16 texture locations, so, its possible to fit 4 textures of 1024 into 1 of 2048, that's why `boundCountPerBuffer` exists.
In that case, if you render the tilemap with other textures, textures will be re-uploaded - that can slow down things due to extra `subTexImage2D` in frame.

This is old RpgMakerMV-compatible setting:

```js
PIXI.tilemap.Constant.boundCountPerBuffer = 4;
PIXI.tilemap.Constant.maxTextures = 4;
```

Or you can just set `maxTextures` to 16 and forget about old devices and `texImage2D` slowdown.

There's also a limitation on 16k tiles per one tilemap. If you want to lift it, please use pixi v5.1.0 and following setting:

```js
PIXI.tilemap.Constant.use32bitIndex = true;
```

For RPGMaker MV please use [v4 branch](https://github.com/pixijs/pixi-tilemap/tree/v4.x) for pixi V4, npm version is `1.2.6`

Please use [v3 branch](https://github.com/pixijs/pixi-tilemap/tree/pixiv3) for pixi V3.

Canvas fallback is 5x slower than vanilla rpgmaker. Webgl version is faster and doesnt use extra textures.

## Demos

### RPGMaker demo

[webgl](https://pixijs.github.io/pixi-tilemap/): [zoomin](https://pixijs.github.io/pixi-tilemap/?scale=0.6) and [zoomout](https://pixijs.github.io/pixi-tilemap/?scale=1.4)

[retina webgl](https://pixijs.github.io/pixi-tilemap/?resolution=2): [zoomin](https://pixijs.github.io/pixi-tilemap/?resolution=2&scale=0.6) and [zoomout](https://pixijs.github.io/pixi-tilemap/?resolution=2&scale=1.4)

[canvas](https://pixijs.github.io/pixi-tilemap/?canvas)

### Basic demo :pen:

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
  var tilemap = new PIXI.tilemap.CompositeRectTileLayer(0, [
    resources['atlas_image'].texture,
  ]);
  var size = 32;
  // bah, im too lazy, i just want to specify filenames from atlas
  for (var i = 0; i < 7; i++)
    for (var j = 0; j < 7; j++) {
      tilemap.addFrame('grass.png', i * size, j * size);
      if (i % 2 == 1 && j % 2 == 1)
        tilemap.addFrame('tough.png', i * size, j * size);
    }

  // if you are lawful citizen, please use textures from the loader
  var textures = resources.atlas.textures;
  tilemap.addFrame(textures['brick.png'], 2 * size, 2 * size);
  tilemap.addFrame(textures['brick_wall.png'], 2 * size, 3 * size);

  renderer.render(tilemap);
});
```

## Serving the examples locally

You can serve the examples after checking out this repository and installing it,
by running the following command.

```
npm run serve
```

rpgmaker -> `http://localhost:5000/`
basic -> `http://localhost:5000/basic`

## More tutorials :link:

[Alan01252 tutorial](https://github.com/Alan01252/pixi-tilemap-tutorial)
