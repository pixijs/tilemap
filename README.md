# @pixi/tilemap - PixiJS Tilemap Kit

[![Node.js CI](https://github.com/pixijs/tilemap/actions/workflows/node.js.yml/badge.svg)](https://github.com/pixijs/tilemap/actions/workflows/node.js.yml)
<p align="center">
<img src="https://i.imgur.com/hfoiBRk.png" width="1280px" />
<p/>

This package provides a low-level rectangular tilemap implementation, optimized for high performance rendering and a
out-of-the-box canvas fallback. It's designed to work with PixiJS 8.

For PixiJS v7 please see [v7 branch](https://github.com/pixijs/tilemap/tree/v7), npm version `4.1.0`.

## Installation :package:

```bash
# pixi-tilemap for older versions
npm i --save @pixi/tilemap
```

You can also use the UMD flavor:

```
<script src="https://cdn.jsdelivr.net/npm/@pixi/tilemap@latest/dist/pixi-tilemap.js"></script>
```

## Usage

In short, the tilemap you create will render each tile texture at the provided position and dimensions. Generally, a
spritesheet is used to load the tileset assets:

```ts
import { Assets } from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';

Assets.add('atlas', 'atlas.json');
Assets.load(['atlas']).then(() =>
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

Temporarily switched off

#### TEXTILE_UNITS

Temporarily switched off

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
