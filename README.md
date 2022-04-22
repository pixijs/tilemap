# @pixi/tilemap - PixiJS Tilemap Kit

[![Node.js CI](https://github.com/pixijs/tilemap/actions/workflows/node.js.yml/badge.svg)](https://github.com/pixijs/tilemap/actions/workflows/node.js.yml)
[![Latest PixiJS Node.js CI](https://github.com/pixijs/tilemap/actions/workflows/pixijs.yml/badge.svg)](https://github.com/pixijs/tilemap/actions/workflows/pixijs.yml)
<p align="center">
<img src="https://i.imgur.com/hfoiBRk.png" width="1280px" />
<p/>

This package provides a low-level rectangular tilemap implementation, optimized for high performance rendering and a
out-of-the-box canvas fallback. It's designed to work with PixiJS 6. **We've migrated from pixi-tilemap to @pixi/tilemap on npm!**

## Installation :package:

```bash
# pixi-tilemap for older versions
npm i --save @pixi/tilemap
```

You can also use the UMD flavor:

```
<script src="https://cdn.jsdelivr.net/npm/@pixi/tilemap@latest/dist/pixi-tilemap.umd.js"></script>
```

## Usage

In short, the tilemap you create will render each tile texture at the provided position and dimensions. Generally, a
spritesheet is used to load the tileset assets:

```ts
import { Loader } from '@pixi/loaders';
import { CompositeTilemap } from '@pixi/tilemap';

Loader.shared.add('atlas.json');
Loader.shared.onLoad(function onTilesetLoaded()
{
    const tilemap = new CompositeTilemap();

    // Render your first tile at (0, 0)!
    tilemap.tile('grass.png', 0, 0);
});
```

`CompositeTilemap` is actually a lazy composite of layered `Tilemap` instances. A `Tilemap` has a fixed number of tile
textures (the tileset) it can render in one go. Usually, `CompositeTilemap` abstracts away this limitation in a robust
enough manner.

### Basic demo :pen:

[webgl](https://pixijs.github.io/tilemap/basic.html)

### Settings :page_facing_up:

```ts
import { settings } from '@pixi/tilemap';
```

#### TEXTURES_PER_TILEMAP

This is the limit on how many base-textures can be used in a tilemap. Using more than this limit will fail silently. `CompositeTilemap`
gets around this by issuing new tilemaps whenever the tilemaps reach full capacity. This is 16 by default.

```js
settings.TEXTURES_PER_TILEMAP = 8;
```

Here, for example, the 9th tile texture will be rendered using a fresh tilemap. You can specify a bigger value if
you want everything to be on the same z-index.

#### TEXTILE_UNITS

@pixi/tilemap also provides a texture packing optimization - it will upload multiple tile base-textures by laying them
in a 2-column format inside a larger base-texture. By default, this is disabled and TEXTILE_UNITS is set 1. The recommended
value is 4, if the feature is desired.

This is old RpgMakerMV-compatible setting:

```js
settings.TEXTILE_UNITS = 4;
settings.TEXTURES_PER_TILEMAP = 4;
```

#### use32bitIndex

There's also a limitation on 16k tiles per one tilemap. If you want to lift it, please use pixi v5.1.0 and following setting:

```js
settings.use32bitIndex = true;
```

## RPGMaker

For RPGMaker MV please use [v4 branch](https://github.com/pixijs/pixi-tilemap/tree/v4.x) for pixi V4, npm version is `1.2.6`

Please use [v3 branch](https://github.com/pixijs/pixi-tilemap/tree/pixiv3) for pixi V3.

Canvas fallback is 5x slower than vanilla rpgmaker. Webgl version is faster and doesnt use extra textures.

### RPGMaker demo

[webgl](https://pixijs.github.io/tilemap/): [zoomin](https://pixijs.github.io/tilemap/?scale=0.6) and [zoomout](https://pixijs.github.io/tilemap/?scale=1.4)

[retina webgl](https://pixijs.github.io/tilemap/?resolution=2): [zoomin](https://pixijs.github.io/pixi-tilemap/?resolution=2&scale=0.6) and [zoomout](https://pixijs.github.io/pixi-tilemap/?resolution=2&scale=1.4)

[canvas](https://pixijs.github.io/tilemap/?canvas)

## More tutorials :link:

[Alan01252 tutorial](https://github.com/Alan01252/pixi-tilemap-tutorial)
