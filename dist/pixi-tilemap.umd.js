/* eslint-disable */
 
/*!
 * pixi-tilemap - v2.1.4
 * Compiled Sun, 07 Mar 2021 02:13:58 UTC
 *
 * pixi-tilemap is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Ivan Popelyshev, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
this.PIXI.tilemap = this.PIXI.tilemap || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/display'), require('@pixi/core'), require('@pixi/constants'), require('@pixi/math'), require('@pixi/sprite'), require('@pixi/utils')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/display', '@pixi/core', '@pixi/constants', '@pixi/math', '@pixi/sprite', '@pixi/utils'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pixi_tilemap = {}, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI.utils));
}(this, (function (exports, display, core, constants, math, sprite, utils) { 'use strict';

    /**
     * The renderer plugin for canvas. It isn't registered by default.
     *
     * ```
     * import { CanvasTileRenderer } from '@pixi/tilemap';
     * import { CanvasRenderer } from '@pixi/canvas-core';
     *
     * // You must register this yourself (optional). @pixi/tilemap doesn't do it to
     * // prevent a hard dependency on @pixi/canvas-core.
     * CanvasRenderer.registerPlugin('tilemap', CanvasTileRenderer);
     * ```
     */
    // TODO: Move to @pixi/tilemap-canvas
    class CanvasTileRenderer
    {
        /** The renderer */
        

        /** The global tile animation state */
        __init() {this.tileAnim = [0, 0];}

        /** @deprecated */
        __init2() {this.dontUseTransform = false;}

        /** @param renderer */
        constructor(renderer)
        {;CanvasTileRenderer.prototype.__init.call(this);CanvasTileRenderer.prototype.__init2.call(this);
            this.renderer = renderer;
            this.tileAnim = [0, 0];
        }
    }

    const Constant = {
        maxTextures: 16,
        bufferSize: 2048,
        boundSize: 1024,
        boundCountPerBuffer: 1,
        use32bitIndex: false,
        SCALE_MODE: constants.SCALE_MODES.LINEAR,
        DO_CLEAR: true
    };

    const POINT_STRUCT_SIZE = 12;

    /**
     * A rectangular tilemap implementation that renders a predefined set of tile textures.
     *
     * The {@link Tilemap.tileset tileset} of a tilemap defines the list of textures that can be painted in the
     * tilemap. The texture is identified using its index into the this list, i.e. changing the texture at a given
     * index in the tileset modifies the paint of all tiles pointing to that index.
     *
     * The size of the tileset is limited by the texture units supported by the client device. The minimum supported
     * value is 8, as defined by the WebGL 1 specification. `gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS`) can be used
     * to extract this limit. {@link CompositeTilemap} can be used to get around this limit by layering multiple tilemap
     * instances.
     *
     * @example
     * import { Tilemap } from '@pixi/tilemap';
     * import { Loader } from '@pixi/loaders';
     *
     * // Add the spritesheet into your loader!
     * Loader.shared.add('atlas', 'assets/atlas.json');
     *
     * // Make the tilemap once the tileset assets are available.
     * Loader.shared.load(function onTilesetLoaded()
     * {
     *      // These textures should've been in the spritesheet. If you don't
     *      // use a spritesheet, this technique will still work as long as
     *      // each individual texture is served.
     *      const tilemap = new Tilemap([
     *          Texture.from('grass.png'),
     *          Texture.from('tough.png'),
     *          Texture.from('brick.png'),
     *          Texture.from('brick_wall.png'),
     *          Texture.from('chest.png')
     *      ])
     *      // Now you defined each tile to generate the tilemap!
     *          .tile('grass.png', 0, 0)
     *          .tile('grass.png', 100, 100)
     *          .tile('brick_wall.png', 0, 100);
     * });
     */
    class Tilemap extends display.Container
    {
        // zIndex to zero by DisplayObject
        __init() {this.modificationMarker = 0;}
        __init2() {this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);}
        __init3() {this._globalMat = null;}
        __init4() {this.hasAnim = false;}
        __init5() {this.offsetX = 0;}
        __init6() {this.offsetY = 0;}
        __init7() {this.compositeParent = false;}
        __init8() {this.tileAnim = null;}

        /**
         * The list of textures being used in the tilemap.
         *
         * This should not be shuffled after tiles have been added into this tilemap. Usually, only tile textures
         * should be added after tiles have been added into the map.
         */
        

        /**
         * The local bounds of the tilemap itself. This does not include DisplayObject children.
         */
          __init9() {this.tilemapBounds = new display.Bounds();}

         __init10() {this.pointsBuf = [];}

        /**
         * @param tileset - The tileset to use for the tilemap. This can be reset later with {@link Tilemap.setTileset}.
         */
        


        constructor(arg0, arg1)
        {
            super();Tilemap.prototype.__init.call(this);Tilemap.prototype.__init2.call(this);Tilemap.prototype.__init3.call(this);Tilemap.prototype.__init4.call(this);Tilemap.prototype.__init5.call(this);Tilemap.prototype.__init6.call(this);Tilemap.prototype.__init7.call(this);Tilemap.prototype.__init8.call(this);Tilemap.prototype.__init9.call(this);Tilemap.prototype.__init10.call(this);Tilemap.prototype.__init11.call(this);Tilemap.prototype.__init12.call(this);Tilemap.prototype.__init13.call(this);Tilemap.prototype.__init14.call(this);Tilemap.prototype.__init15.call(this);;

            const zIndex = typeof arg0 === 'number' ? arg0 : 0;
            const tileset = typeof arg0 !== 'number' ? arg0 : arg1;

            this.zIndex = zIndex;
            this.setTileset(tileset);
        }

        /**
         * @returns The tileset of this tilemap.
         */
        getTileset()
        {
            return this.tileset;
        }

        /**
         * Define the tileset used by the tilemap.
         *
         * @param tileset - The list of textures to use in the tilemap. If a texture (not array) is passed, it will
         *  be wrapped into an array.
         */
        setTileset(tileset = [])
        {
            if (!Array.isArray(tileset))
            {
                tileset = [tileset];
            }

            this.tileset = tileset;

            return this;
        }

        /**  Clears all the tiles added into this tilemap. */
        clear()
        {
            this.pointsBuf.length = 0;
            this.modificationMarker = 0;
            this.tilemapBounds.clear();
            this.hasAnim = false;

            return this;
        }

        /**
         * Adds a tile that paints the given texture at (x, y).
         *
         * @param tileTexture - The tiling texture to render.
         * @param x - The local x-coordinate of the tile's position.
         * @param y - The local y-coordinate of the tile's position.
         * @param options - Additional tile options.
         * @param [options.u=texture.frame.x] - The x-coordinate of the texture in its base-texture's space.
         * @param [options.v=texture.frame.y] - The y-coordinate of the texture in its base-texture's space.
         * @param [options.tileWidth=texture.orig.width] - The local width of the tile.
         * @param [options.tileHeight=texture.orig.height] - The local height of the tile.
         * @param [options.animX=0]
         * @param [options.animY=0]
         * @param [options.rotate=0]
         * @param [options.animCountX=1024]
         * @param [options.animCountY=1024]
         * @returns
         */
        tile(
            tileTexture,
            x,
            y,
            options










        )
        {
            let texture;
            let textureIndex = -1;

            if (typeof tileTexture === 'number')
            {
                textureIndex = tileTexture;
                texture = this.tileset[textureIndex];
            }
            else
            {
                if (typeof tileTexture === 'string')
                {
                    texture = core.Texture.from(tileTexture);
                }
                else
                {
                    texture = tileTexture ;
                }

                const textureList = this.tileset;

                for (let i = 0; i < textureList.length; i++)
                {
                    if (textureList[i].baseTexture === texture.baseTexture)
                    {
                        textureIndex = i;
                        break;
                    }
                }
            }

            if (!texture || textureIndex < 0)
            {
                console.error('The tile texture was not found in the tilemap tileset.');

                return this;
            }

            const {
                u = texture.frame.x,
                v = texture.frame.y,
                tileWidth = texture.orig.width,
                tileHeight = texture.orig.height,
                animX = 0,
                animY = 0,
                rotate = 0,
                animCountX = 1024,
                animCountY = 1024,
            } = options;

            const pb = this.pointsBuf;

            this.hasAnim = this.hasAnim || animX > 0 || animY > 0;

            pb.push(u);
            pb.push(v);
            pb.push(x);
            pb.push(y);
            pb.push(tileWidth);
            pb.push(tileHeight);
            pb.push(rotate);
            pb.push(animX | 0);
            pb.push(animY | 0);
            pb.push(textureIndex);
            pb.push(animCountX);
            pb.push(animCountY);

            this.tilemapBounds.addFramePad(x, y, x + tileWidth, y + tileHeight, 0, 0);

            return this;
        }

        /** Changes the rotation of the last tile. */
        tileRotate(rotate)
        {
            const pb = this.pointsBuf;

            // This seems off.
            pb[pb.length - 3] = rotate;
        }

        /** Changes the `animX`, `animCountX` of the last tile. */
        tileAnimX(offset, count)
        {
            const pb = this.pointsBuf;

            pb[pb.length - 5] = offset;
            pb[pb.length - 2] = count;
        }

        /** Changes the `animY`, `animCountY` of the last tile. */
        tileAnimY(offset, count)
        {
            const pb = this.pointsBuf;

            pb[pb.length - 4] = offset;
            pb[pb.length - 1] = count;
        }

        renderCanvas(renderer)
        {
            const plugin = renderer.plugins.tilemap;

            if (plugin && !plugin.dontUseTransform)
            {
                const wt = this.worldTransform;

                renderer.context.setTransform(
                    wt.a,
                    wt.b,
                    wt.c,
                    wt.d,
                    wt.tx * renderer.resolution,
                    wt.ty * renderer.resolution
                );
            }

            this.renderCanvasCore(renderer);
        }

        renderCanvasCore(renderer)
        {
            if (this.tileset.length === 0) return;
            const points = this.pointsBuf;
            const tileAnim = this.tileAnim || (renderer.plugins.tilemap && renderer.plugins.tilemap.tileAnim);

            renderer.context.fillStyle = '#000000';
            for (let i = 0, n = points.length; i < n; i += POINT_STRUCT_SIZE)
            {
                let x1 = points[i]; let
                    y1 = points[i + 1];
                const x2 = points[i + 2]; const
                    y2 = points[i + 3];
                const w = points[i + 4];
                const h = points[i + 5];
                // const rotate = points[i + 6];

                x1 += points[i + 7] * tileAnim[0];
                y1 += points[i + 8] * tileAnim[1];
                const textureIndex = points[i + 9];
                // canvas does not work with rotate yet

                if (textureIndex >= 0 && this.tileset[textureIndex])
                {
                    renderer.context.drawImage(
                        (this.tileset[textureIndex].baseTexture ).getDrawableSource(),
                        x1, y1, w, h, x2, y2, w, h
                    );
                }
                else
                {
                    renderer.context.globalAlpha = 0.5;
                    renderer.context.fillRect(x2, y2, w, h);
                    renderer.context.globalAlpha = 1;
                }
            }
        }

         __init11() {this.vbId = 0;}
         __init12() {this.vb = null;}
         __init13() {this.vbBuffer = null;}
         __init14() {this.vbArray = null;}
         __init15() {this.vbInts = null;}

         destroyVb()
        {
            if (this.vb)
            {
                this.vb.destroy();
                this.vb = null;
            }
        }

        render(renderer)
        {
            const plugin = (renderer.plugins ).tilemap;
            const shader = plugin.getShader();

            renderer.batch.setObjectRenderer(plugin);
            this._globalMat = shader.uniforms.projTransMatrix;
            renderer
                .globalUniforms
                .uniforms
                .projectionMatrix
                .copyTo(this._globalMat)
                .append(this.worldTransform);

            shader.uniforms.shadowColor = this.shadowColor;
            shader.uniforms.animationFrame = this.tileAnim || plugin.tileAnim;

            this.renderWebGLCore(renderer, plugin);
        }

        renderWebGLCore(renderer, plugin)
        {
            const points = this.pointsBuf;

            if (points.length === 0) return;
            const rectsCount = points.length / POINT_STRUCT_SIZE;

            const shader = plugin.getShader();
            const textures = this.tileset;

            if (textures.length === 0) return;

            plugin.bindTextures(renderer, shader, textures);
            renderer.shader.bind(shader, false);

            // lost context! recover!
            let vb = this.vb;

            if (!vb)
            {
                vb = plugin.createVb();
                this.vb = vb;
                this.vbId = (vb ).id;
                this.vbBuffer = null;
                this.modificationMarker = 0;
            }

            plugin.checkIndexBuffer(rectsCount, vb);
            const boundCountPerBuffer = Constant.boundCountPerBuffer;

            const vertexBuf = vb.getBuffer('aVertexPosition');
            // if layer was changed, re-upload vertices
            const vertices = rectsCount * vb.vertPerQuad;

            if (vertices === 0) return;
            if (this.modificationMarker !== vertices)
            {
                this.modificationMarker = vertices;
                const vs = vb.stride * vertices;

                if (!this.vbBuffer || this.vbBuffer.byteLength < vs)
                {
                    // !@#$ happens, need resize
                    let bk = vb.stride;

                    while (bk < vs)
                    {
                        bk *= 2;
                    }
                    this.vbBuffer = new ArrayBuffer(bk);
                    this.vbArray = new Float32Array(this.vbBuffer);
                    this.vbInts = new Uint32Array(this.vbBuffer);
                    vertexBuf.update(this.vbBuffer);
                }

                const arr = this.vbArray;
                // const ints = this.vbInts;
                // upload vertices!
                let sz = 0;
                // let tint = 0xffffffff;
                let textureId = 0;
                let shiftU = this.offsetX;
                let shiftV = this.offsetY;

                // let tint = 0xffffffff;
                // const tint = -1;

                for (let i = 0; i < points.length; i += POINT_STRUCT_SIZE)
                {
                    const eps = 0.5;

                    if (this.compositeParent)
                    {
                        if (boundCountPerBuffer > 1)
                        {
                            // TODO: what if its more than 4?
                            textureId = (points[i + 9] >> 2);
                            shiftU = this.offsetX * (points[i + 9] & 1);
                            shiftV = this.offsetY * ((points[i + 9] >> 1) & 1);
                        }
                        else
                        {
                            textureId = points[i + 9];
                            shiftU = 0;
                            shiftV = 0;
                        }
                    }
                    const x = points[i + 2]; const
                        y = points[i + 3];
                    const w = points[i + 4]; const
                        h = points[i + 5];
                    const u = points[i] + shiftU; const
                        v = points[i + 1] + shiftV;
                    let rotate = points[i + 6];

                    const animX = points[i + 7]; const
                        animY = points[i + 8];
                    const animWidth = points[i + 10] || 1024; const
                        animHeight = points[i + 11] || 1024;
                    const animXEncoded = animX + (animWidth * 2048);
                    const animYEncoded = animY + (animHeight * 2048);

                    let u0;
                    let v0; let u1;
                    let v1; let u2;
                    let v2; let u3;
                    let v3;

                    if (rotate === 0)
                    {
                        u0 = u;
                        v0 = v;
                        u1 = u + w;
                        v1 = v;
                        u2 = u + w;
                        v2 = v + h;
                        u3 = u;
                        v3 = v + h;
                    }
                    else
                    {
                        let w2 = w / 2;
                        let h2 = h / 2;

                        if (rotate % 4 !== 0)
                        {
                            w2 = h / 2;
                            h2 = w / 2;
                        }
                        const cX = u + w2;
                        const cY = v + h2;

                        rotate = math.groupD8.add(rotate, math.groupD8.NW);
                        u0 = cX + (w2 * math.groupD8.uX(rotate));
                        v0 = cY + (h2 * math.groupD8.uY(rotate));

                        rotate = math.groupD8.add(rotate, 2); // rotate 90 degrees clockwise
                        u1 = cX + (w2 * math.groupD8.uX(rotate));
                        v1 = cY + (h2 * math.groupD8.uY(rotate));

                        rotate = math.groupD8.add(rotate, 2);
                        u2 = cX + (w2 * math.groupD8.uX(rotate));
                        v2 = cY + (h2 * math.groupD8.uY(rotate));

                        rotate = math.groupD8.add(rotate, 2);
                        u3 = cX + (w2 * math.groupD8.uX(rotate));
                        v3 = cY + (h2 * math.groupD8.uY(rotate));
                    }

                    arr[sz++] = x;
                    arr[sz++] = y;
                    arr[sz++] = u0;
                    arr[sz++] = v0;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animXEncoded;
                    arr[sz++] = animYEncoded;
                    arr[sz++] = textureId;
                    arr[sz++] = x + w;
                    arr[sz++] = y;
                    arr[sz++] = u1;
                    arr[sz++] = v1;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animXEncoded;
                    arr[sz++] = animYEncoded;
                    arr[sz++] = textureId;
                    arr[sz++] = x + w;
                    arr[sz++] = y + h;
                    arr[sz++] = u2;
                    arr[sz++] = v2;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animXEncoded;
                    arr[sz++] = animYEncoded;
                    arr[sz++] = textureId;
                    arr[sz++] = x;
                    arr[sz++] = y + h;
                    arr[sz++] = u3;
                    arr[sz++] = v3;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animXEncoded;
                    arr[sz++] = animYEncoded;
                    arr[sz++] = textureId;
                }

                vertexBuf.update(arr);
            }

            (renderer.geometry ).bind(vb, shader);
            renderer.geometry.draw(constants.DRAW_MODES.TRIANGLES, rectsCount * 6, 0);
        }

        /**
         * @internal
         * @ignore
         */
        isModified(anim)
        {
            if (this.modificationMarker !== this.pointsBuf.length
                || (anim && this.hasAnim))
            {
                return true;
            }

            return false;
        }

        /**
         * This will pull forward the modification marker.
         *
         * @internal
         * @ignore
         */
        clearModify()
        {
            this.modificationMarker = this.pointsBuf.length;
        }

        /** @override */
         _calculateBounds()
        {
            const { minX, minY, maxX, maxY } = this.tilemapBounds;

            this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
        }

        /** @override */
         getLocalBounds(rect)
        {
            // we can do a fast local bounds if the sprite has no children!
            if (this.children.length === 0)
            {
                return this.tilemapBounds.getRectangle(rect);
            }

            return super.getLocalBounds.call(this, rect);
        }

        /** @override */
        destroy(options)
        {
            super.destroy(options);
            this.destroyVb();
        }

        /**
         * This initialization routine has been replaced by {@link Tilemap.setTileset setTileset}.
         *
         * @deprecated Since @pixi/tilemap 3.
         * @param zIndex - The z-index of the tilemap.
         * @param textures - The tileset to use.
         */
        initialize(zIndex, textures)
        {
            this.zIndex = zIndex || 0;
            this.setTileset(textures);
        }

        /**
         * Deprecated signature for {@link Tilemap.tile tile}.
         *
         * @deprecated Since @pixi/tilemap 3.
         */
        addFrame(texture, x, y, animX, animY)
        {
            this.tile(
                texture,
                x,
                y,
                {
                    animX,
                    animY,
                }
            );

            return true;
        }

        /**
         * Deprecated signature for {@link Tilemap.tile tile}.
         *
         * @deprecated Since @pixi/tilemap 3.
         */
        // eslint-disable-next-line max-params
        addRect(
            textureIndex,
            u,
            v,
            x,
            y,
            tileWidth,
            tileHeight,
            animX = 0,
            animY = 0,
            rotate = 0,
            animCountX = 1024,
            animCountY = 1024
        )
        {
            return this.tile(
                textureIndex,
                x, y,
                {
                    u, v, tileWidth, tileHeight, animX, animY, rotate, animCountX, animCountY
                }
            );
        }
    }

    /**
     * A tilemap composite that lazily builds tilesets layered into multiple tilemaps.
     *
     * The composite tileset is the concatenatation of the individual tilesets used in the tilemaps. You can
     * preinitialized it by passing a list of tile textures to the constructor. Otherwise, the composite tilemap
     * is lazily built as you add more tiles with newer tile textures. A new tilemap is created once the last
     * tilemap has reached its limit (as set by {@link CompositeTilemap.texturesPerTilemap texturesPerTilemap}).
     *
     * @example
     * import { Application } from '@pixi/app';
     * import { CompositeTilemap } from '@pixi/tilemap';
     * import { Loader } from '@pixi/loaders';
     *
     * // Setup view & stage.
     * const app = new Application();
     *
     * document.body.appendChild(app.renderer.view);
     * app.stage.interactive = true;
     *
     * // Global reference to the tilemap.
     * let globalTilemap: CompositeTilemap;
     *
     * // Load the tileset spritesheet!
     * Loader.shared.load('atlas.json');
     *
     * // Initialize the tilemap scene when the assets load.
     * Loader.shared.load(function onTilesetLoaded()
     * {
     *      // Preinitialize with two most used textures
     *      const tilemap = new CompositeTilemap([
     *          Texture.from('grass.png'),
     *          Texture.from('dungeon.png'),
     *      ]);
     *
     *      // Setup the game level with grass and dungeons!
     *      for (let x = 0; x < 10; x++)
     *      {
     *          for (let y = 0; y < 10; y++)
     *          {
     *              tilemap.tile(
     *                  x % 2 === 0 && (x === y || x + y === 10) ? 'dungeon.png' : 'grass.png',
     *                  x * 100,
     *                  y * 100,
     *              );
     *          }
     *      }
     *
     *      globalTilemap = app.stage.addChild(tilemap);
     * });
     *
     * // Show a bomb at a random location whenever the user clicks!
     * app.stage.on('click', function onClick()
     * {
     *      if (!globalTilemap) return;
     *
     *      const x = Math.floor(Math.random() * 10);
     *      const y = Math.floor(Math.random() * 10);
     *
     *      globalTilemap.tile('bomb.png', x * 100, y * 100);
     * });
     */
    class CompositeTilemap extends display.Container
    {
        /** The hard limit on the number of tile textures used in each tilemap. */
        

        /** The animation parameters */
         __init() {this.tileAnim = null;}

        /** The last modified tilemap. */
         __init2() {this.lastModifiedTilemap = null;}

         __init3() {this.modificationMarker = 0;}
         __init4() {this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);}
         __init5() {this._globalMat = null;}

        /**
         * @param tileset - A list of tile textures that will be used to eagerly initialized the layered
         *  tilemaps. This is only an performance optimization, and using {@link CompositeTilemap.tile tile}
         *  will work equivalently.
         * @param texturesPerTilemap - A custom limit on the number of tile textures used in each tilemap.
         */
        




        constructor(bitmaps, texPerChild, arg2)
        {
            super();CompositeTilemap.prototype.__init.call(this);CompositeTilemap.prototype.__init2.call(this);CompositeTilemap.prototype.__init3.call(this);CompositeTilemap.prototype.__init4.call(this);CompositeTilemap.prototype.__init5.call(this);CompositeTilemap.prototype.__init6.call(this);;

            const zIndex = typeof bitmaps === 'number' ? bitmaps : 0;
            // eslint-disable-next-line no-nested-ternary
            const tileset = Array.isArray(bitmaps) ? bitmaps : (Array.isArray(texPerChild) ? texPerChild : null);
            const texturesPerTilemap = typeof texPerChild === 'number' ? texPerChild : arg2;

            this.zIndex = zIndex;
            this.tileset(tileset);
            this.texturesPerTilemap = texturesPerTilemap || Constant.boundCountPerBuffer * Constant.maxTextures;
        }

        /**
         * This will preinitialize the tilesets of the layered tilemaps.
         *
         * If used after a tilemap has been created (or a tile added), this will overwrite the tile textures of the
         * existing tilemaps. Passing the tileset to the constructor instead is the best practice.
         *
         * @param tileTextures - The list of tile textures that make up the tileset.
         */
        tileset(tileTextures)
        {
            if (!tileTextures)
            {
                tileTextures = [];
            }

            // Sanity check!
            for (let i = 0; i < tileTextures.length; i++)
            {
                if (tileTextures[i] && !tileTextures[i].baseTexture)
                {
                    throw new Error(`pixi-tilemap cannot use destroyed textures. `
                        + `Probably, you passed resources['myAtlas'].texture in pixi > 5.2.1, it does not exist there.`);
                }
            }

            const texPerChild = this.texturesPerTilemap;
            const len1 = this.children.length;
            const len2 = Math.ceil(tileTextures.length / texPerChild);

            for (let i = 0; i < len1; i++)
            {
                (this.children[i] ).setTileset(
                    tileTextures.slice(i * texPerChild, (i + 1) * texPerChild)
                );
            }
            for (let i = len1; i < len2; i++)
            {
                const layer = new Tilemap(this.zIndex, tileTextures.slice(i * texPerChild, (i + 1) * texPerChild));

                layer.compositeParent = true;
                layer.offsetX = Constant.boundSize;
                layer.offsetY = Constant.boundSize;

                this.addChild(layer);
            }

            return this;
        }

        /** Clears the tilemap composite. */
        clear()
        {
            for (let i = 0; i < this.children.length; i++)
            {
                (this.children[i] ).clear();
            }

            this.modificationMarker = 0;

            return this;
        }

        /** Changes the rotation of the last added tile. */
        tileRotate(rotate)
        {
            if (this.lastModifiedTilemap)
            {
                this.lastModifiedTilemap.tileRotate(rotate);
            }

            return this;
        }

        /** Changes `animX`, `animCountX` of the last added tile. */
        tileAnimX(offset, count)
        {
            if (this.lastModifiedTilemap)
            {
                this.lastModifiedTilemap.tileAnimX(offset, count);
            }

            return this;
        }

        /** Changes `animY`, `animCountY` of the last added tile. */
        tileAnimY(offset, count)
        {
            if (this.lastModifiedTilemap)
            {
                this.lastModifiedTilemap.tileAnimY(offset, count);
            }

            return this;
        }

        /**
         * Adds a tile that paints the given tile texture at (x, y).
         *
         * @param tileTexture - The tile texture. You can pass an index into the composite tilemap as well.
         * @param x - The local x-coordinate of the tile's location.
         * @param y - The local y-coordinate of the tile's location.
         * @param options - Additional options to pass to {@link Tilemap.tile}.
         */
        tile(
            texture_,
            x,
            y,
            options









     = {}
        )
        {
            let texture;
            let layer = null;
            let ind  = 0;
            const children = this.children;

            this.lastModifiedTilemap = null;

            if (typeof texture_ === 'number')
            {
                const childIndex = texture_ / this.texturesPerTilemap >> 0;

                layer = children[childIndex] ;

                if (!layer)
                {
                    layer = children[0] ;
                    if (!layer)
                    {
                        return this;
                    }
                    ind = 0;
                }
                else
                {
                    ind = texture_ % this.texturesPerTilemap;
                }

                texture = layer.getTileset()[ind];
            }
            else
            {
                if (typeof texture_ === 'string')
                {
                    texture = core.Texture.from(texture_);
                }
                else
                {
                    texture = texture_ ;
                }

                for (let i = 0; i < children.length; i++)
                {
                    const child = children[i] ;
                    const tex = child.getTileset();

                    for (let j = 0; j < tex.length; j++)
                    {
                        if (tex[j].baseTexture === texture.baseTexture)
                        {
                            layer = child;
                            ind = j;
                            break;
                        }
                    }
                    if (layer)
                    {
                        break;
                    }
                }

                if (!layer)
                {
                    for (let i = 0; i < children.length; i++)
                    {
                        const child = children[i] ;

                        if (child.getTileset().length < this.texturesPerTilemap)
                        {
                            layer = child;
                            ind = child.getTileset().length;
                            child.getTileset().push(texture);
                            break;
                        }
                    }
                    if (!layer)
                    {
                        layer = new Tilemap(this.zIndex, texture);
                        layer.compositeParent = true;
                        layer.offsetX = Constant.boundSize;
                        layer.offsetY = Constant.boundSize;
                        this.addChild(layer);
                        ind = 0;
                    }
                }
            }

            this.lastModifiedTilemap = layer;
            layer.tile(
                ind,
                x,
                y,
                options,
            );

            return this;
        }

        renderCanvas(renderer)
        {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
            {
                return;
            }

            const tilemapPlugin = renderer.plugins.tilemap;

            if (tilemapPlugin && !tilemapPlugin.dontUseTransform)
            {
                const wt = this.worldTransform;

                renderer.context.setTransform(
                    wt.a,
                    wt.b,
                    wt.c,
                    wt.d,
                    wt.tx * renderer.resolution,
                    wt.ty * renderer.resolution
                );
            }

            const layers = this.children;

            for (let i = 0; i < layers.length; i++)
            {
                const layer = (layers[i] );

                layer.tileAnim = this.tileAnim;
                layer.renderCanvasCore(renderer);
            }
        }

        render(renderer)
        {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
            {
                return;
            }

            const plugin = renderer.plugins.tilemap ;
            const shader = plugin.getShader();

            renderer.batch.setObjectRenderer(plugin);

            // TODO: dont create new array, please
            this._globalMat = shader.uniforms.projTransMatrix;
            renderer.globalUniforms.uniforms.projectionMatrix.copyTo(this._globalMat).append(this.worldTransform);
            shader.uniforms.shadowColor = this.shadowColor;
            shader.uniforms.animationFrame = this.tileAnim || plugin.tileAnim;

            renderer.shader.bind(shader, false);

            const layers = this.children;

            for (let i = 0; i < layers.length; i++)
            {
                (layers[i] ).renderWebGLCore(renderer, plugin);
            }
        }

        /**
         * @internal
         * @ignore
         */
        isModified(anim)
        {
            const layers = this.children;

            if (this.modificationMarker !== layers.length)
            {
                return true;
            }
            for (let i = 0; i < layers.length; i++)
            {
                if ((layers[i] ).isModified(anim))
                {
                    return true;
                }
            }

            return false;
        }

        /**
         * @internal
         * @ignore
         */
        clearModify()
        {
            const layers = this.children;

            this.modificationMarker = layers.length;
            for (let i = 0; i < layers.length; i++)
            {
                (layers[i] ).clearModify();
            }
        }

        /**
         * @deprecated Since @pixi/tilemap 3.
         * @see CompositeTilemap.tile
         */
        addFrame(
            texture,
            x,
            y,
            animX,
            animY,
            animWidth,
            animHeight
        )
        {
            return this.tile(
                texture,
                x, y,
                {
                    animX,
                    animY,
                    animCountX: animWidth,
                    animCountY: animHeight,
                }
            );
        }

        /**
         * @deprecated @pixi/tilemap 3
         * @see CompositeTilemap.tile
         */
        // eslint-disable-next-line max-params
        addRect(
            textureIndex,
            u,
            v,
            x,
            y,
            tileWidth,
            tileHeight,
            animX,
            animY,
            rotate,
            animWidth,
            animHeight
        )
        {
            const childIndex = textureIndex / this.texturesPerTilemap >> 0;
            const textureId = textureIndex % this.texturesPerTilemap;

            if (this.children[childIndex] && (this.children[childIndex] ).getTileset())
            {
                this.lastModifiedTilemap = (this.children[childIndex] );
                this.lastModifiedTilemap.addRect(
                    textureId, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate, animWidth, animHeight
                );
            }
            else
            {
                this.lastModifiedTilemap = null;
            }

            return this;
        }

        /**
         * This initialization routine is now done in the constructor.
         *
         * @deprecated Since @pixi/tilemap 3.
         * @param zIndex - The z-index of the tilemap composite.
         * @param bitmaps - The tileset to use.
         * @param texPerChild - The number of textures per tilemap.
         */
        initialize(zIndex, bitmaps, texPerChild)
        {
            if (texPerChild  === true)
            {
                // old format, ignore it!
                texPerChild = 0;
            }

            this.zIndex = zIndex;
            (this ).texturesPerTilemap = texPerChild || Constant.boundCountPerBuffer * Constant.maxTextures;

            if (bitmaps)
            {
                this.tileset(bitmaps);
            }
        }

        /**
         * Alias for {@link CompositeTilemap.tileset tileset}.
         *
         * @deprecated Since @pixi/tilemap 3.
         */
        __init6() {this.setBitmaps = this.tileset;}

        /**
         * @deprecated Since @pixi/tilemap 3.
         * @readonly
         * @see CompositeTilemap.texturesPerTilemap
         */
        get texPerChild() { return this.texturesPerTilemap; }
    }

    // For some reason ESLint goes mad with indendation in this file ^&^
    /* eslint-disable indent */

    /**
     * @internal
     * @ignore
     */
    class MultiTextureResource extends core.Resource
    {
    	 __init() {this.baseTex = null;}

    	 __init2() {this.DO_CLEAR = false;}
    	 __init3() {this.boundSize = 0;}
    	 __init4() {this._clearBuffer = null;}
    	 __init5() {this.boundSprites = [];}
    	 __init6() {this.dirties = [];}

    	constructor(options)
    	{
    		super(options.bufferSize, options.bufferSize);MultiTextureResource.prototype.__init.call(this);MultiTextureResource.prototype.__init2.call(this);MultiTextureResource.prototype.__init3.call(this);MultiTextureResource.prototype.__init4.call(this);MultiTextureResource.prototype.__init5.call(this);MultiTextureResource.prototype.__init6.call(this);;

    		const bounds = this.boundSprites;
    		const dirties = this.dirties;

    		this.boundSize = options.boundSize;

    		for (let j = 0; j < options.boundCountPerBuffer; j++)
    		{
    			const spr = new sprite.Sprite();

    			spr.position.x = options.boundSize * (j & 1);
    			spr.position.y = options.boundSize * (j >> 1);
    			bounds.push(spr);
    			dirties.push(0);
    		}

    		this.DO_CLEAR = !!options.DO_CLEAR;
    	}

    	bind(baseTexture)
    	{
    		if (this.baseTex)
    		{
    			throw new Error('Only one baseTexture is allowed for this resource!');
    		}
    		this.baseTex = baseTexture;
    		super.bind(baseTexture);
    	}
    	setTexture(ind, texture)
    	{
    		const spr = this.boundSprites[ind];

    		if (spr.texture.baseTexture === texture.baseTexture)
    		{
    			return;
    		}
    		spr.texture = texture;
    		this.baseTex.update();
    		this.dirties[ind] = (this.baseTex ).dirtyId;
    	}

    	upload(renderer, texture, glTexture)
    	{
    		const { gl } = renderer ;

    		const { width, height } = this;

    		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.alphaMode === undefined
    	|| texture.alphaMode === constants.ALPHA_MODES.UNPACK);

    		if (glTexture.dirtyId < 0)
    		{
    			(glTexture ).width = width;
    			(glTexture ).height = height;

    			gl.texImage2D(texture.target, 0,
    				texture.format,
    				width,
    				height,
    				0,
    				texture.format,
    				texture.type,
    				null);
    		}

    		const doClear = this.DO_CLEAR;

    		if (doClear && !this._clearBuffer)
    		{
    			this._clearBuffer = new Uint8Array(Constant.boundSize * Constant.boundSize * 4);
    		}

    		const bounds = this.boundSprites;

    		for (let i = 0; i < bounds.length; i++)
    		{
    			const spr = bounds[i];
    			const tex = spr.texture.baseTexture;

    			if (glTexture.dirtyId >= this.dirties[i])
    			{
    				continue;
    			}
    			const res = tex.resource ;

    			if (!tex.valid || !res || !res.source)
    			{
    				continue;
    			}
    			if (doClear && (tex.width < this.boundSize || tex.height < this.boundSize))
    			{
    				gl.texSubImage2D(texture.target, 0,
    					spr.position.x,
    					spr.position.y,
    					this.boundSize,
    					this.boundSize,
    					texture.format,
    					texture.type,
    					this._clearBuffer);
    			}
    			gl.texSubImage2D(texture.target, 0,
    				spr.position.x,
    				spr.position.y,
    				texture.format,
    				texture.type,
    				res.source);
    		}

    		return true;
    	}
    }

    /**
     * @internal
     * @ignore
     * @param shader
     * @param maxTextures
     */
    function fillSamplers(shader, maxTextures)
    {
        const sampleValues = [];

        for (let i = 0; i < maxTextures; i++)
        {
            sampleValues[i] = i;
        }

        shader.uniforms.uSamplers = sampleValues;

        const samplerSize = [];

        for (let i = 0; i < maxTextures; i++)
        {
            samplerSize.push(1.0 / Constant.bufferSize);
            samplerSize.push(1.0 / Constant.bufferSize);
        }

        shader.uniforms.uSamplerSize = samplerSize;
    }

    /**
     * @internal
     * @ignore
     * @param maxTextures
     * @returns
     */
    function generateSampleSrc(maxTextures)
    {
        let src = '';

        src += '\n';
        src += '\n';

        src += 'if(vTextureId <= -1.0) {';
        src += '\n\tcolor = shadowColor;';
        src += '\n}';

        for (let i = 0; i < maxTextures; i++)
        {
            src += '\nelse ';

            if (i < maxTextures - 1)
            {
                src += `if(textureId == ${i}.0)`;
            }

            src += '\n{';
            src += `\n\tcolor = texture2D(uSamplers[${i}], textureCoord * uSamplerSize[${i}]);`;
            src += '\n}';
        }

        src += '\n';
        src += '\n';

        return src;
    }

    /**
     * @internal
     * @ignore
     * @param maxTextures
     * @param fragmentSrc
     * @returns
     */
    function generateFragmentSrc(maxTextures, fragmentSrc)
    {
        return fragmentSrc.replace(/%count%/gi, `${maxTextures}`)
            .replace(/%forloop%/gi, generateSampleSrc(maxTextures));
    }

    var tilemapShaderVertexSrc = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aFrame;\nattribute vec2 aAnim;\nattribute float aTextureId;\n\nuniform mat3 projTransMatrix;\nuniform vec2 animationFrame;\n\nvarying vec2 vTextureCoord;\nvarying float vTextureId;\nvarying vec4 vFrame;\n\nvoid main(void)\n{\n   gl_Position = vec4((projTransMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vec2 animCount = floor((aAnim + 0.5) / 2048.0);\n   vec2 animFrameOffset = aAnim - animCount * 2048.0;\n   vec2 animOffset = animFrameOffset * floor(mod(animationFrame + 0.5, animCount));\n\n   vTextureCoord = aTextureCoord + animOffset;\n   vFrame = aFrame + vec4(animOffset, animOffset);\n   vTextureId = aTextureId;\n}";

    var tilemapShaderFragmentSrc = "varying vec2 vTextureCoord;\nvarying vec4 vFrame;\nvarying float vTextureId;\nuniform vec4 shadowColor;\nuniform sampler2D uSamplers[%count%];\nuniform vec2 uSamplerSize[%count%];\n\nvoid main(void)\n{\n   vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);\n   float textureId = floor(vTextureId + 0.5);\n\n   vec4 color;\n   %forloop%\n   gl_FragColor = color;\n}";

    // eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment

    // For some reason ESLint goes mad with indendation in this file ^&^
    /* eslint-disable no-mixed-spaces-and-tabs, indent */

    class TilemapShader extends core.Shader
    {
    	__init() {this.maxTextures = 0;}

    	constructor(maxTextures, shaderVert, shaderFrag)
    	{
    	    super(
    	        new core.Program(shaderVert, shaderFrag),
    	        {
    	            animationFrame: new Float32Array(2),
    	            uSamplers: [],
    	            uSamplerSize: [],
    	            projTransMatrix: new math.Matrix()
    	        }
    	    );TilemapShader.prototype.__init.call(this);;

    	    this.maxTextures = maxTextures;
    	    fillSamplers(this, this.maxTextures);
    	}
    }

    class RectTileShader extends TilemapShader
    {
        constructor(maxTextures)
        {
            super(
                maxTextures,
                tilemapShaderVertexSrc,
                generateFragmentSrc(maxTextures, tilemapShaderFragmentSrc)
            );
            fillSamplers(this, this.maxTextures);
        }
    }

    class RectTileGeom extends core.Geometry
    {
    	__init2() {this.vertSize = 11;}
    	__init3() {this.vertPerQuad = 4;}
    	__init4() {this.stride = this.vertSize * 4;}
    	__init5() {this.lastTimeAccess = 0;}

    	constructor()
    	{
    	    super();RectTileGeom.prototype.__init2.call(this);RectTileGeom.prototype.__init3.call(this);RectTileGeom.prototype.__init4.call(this);RectTileGeom.prototype.__init5.call(this);;

    	    const buf = this.buf = new core.Buffer(new Float32Array(2), true, false);

    	    this.addAttribute('aVertexPosition', buf, 0, false, 0, this.stride, 0)
    	        .addAttribute('aTextureCoord', buf, 0, false, 0, this.stride, 2 * 4)
    	        .addAttribute('aFrame', buf, 0, false, 0, this.stride, 4 * 4)
    	        .addAttribute('aAnim', buf, 0, false, 0, this.stride, 8 * 4)
    	        .addAttribute('aTextureId', buf, 0, false, 0, this.stride, 10 * 4);
    	}

    	
    }

    // For some reason ESLint goes mad with indendation in this file ^&^
    /* eslint-disable no-mixed-spaces-and-tabs, indent */

    /** Rendering helper pipeline for tilemaps. */
    class TileRenderer extends core.ObjectRenderer
    {
    	/** The managing renderer */
    	

    	/** The tile animation frame */
    	 __init() {this.tileAnim = [0, 0];}

    	 __init2() {this.ibLen = 0;}// index buffer length
    	 __init3() {this.indexBuffer = null;}
    	
    	 __init4() {this.texResources = [];}

    	/** @param renderer - The managing renderer */
    	constructor(renderer)
    	{
    	    super(renderer);TileRenderer.prototype.__init.call(this);TileRenderer.prototype.__init2.call(this);TileRenderer.prototype.__init3.call(this);TileRenderer.prototype.__init4.call(this);;
    	    this.shader = new RectTileShader(Constant.maxTextures);
    	    this.indexBuffer = new core.Buffer(undefined, true, true);
    	    this.checkIndexBuffer(2000);
    	    this.initBounds();
    	}

    	/**
    	 * This internal method is used to bind tile textures.
    	 *
    	 * This method has some undocumented performance characteristics.
    	 */
    	bindTextures(renderer, shader, textures)
    	{
    	    const len = textures.length;
    	    const maxTextures = Constant.maxTextures;

    	    if (len > Constant.boundCountPerBuffer * maxTextures)
    	    {
    	        return;
    	    }
    	    if (Constant.boundCountPerBuffer <= 1)
    	    {
    	        this.bindTexturesWithoutRT(renderer, shader, textures);

    	        return;
    	    }

    	    let i = 0;

    	    for (; i < len; i++)
    	    {
    	        const texture = textures[i];

    	        if (!texture || !texture.valid) continue;
    	        const multi = this.texResources[i >> 2];

    	        multi.setTexture(i & 3, texture);
    	    }

    	    const gltsUsed = (i + 3) >> 2;

    	    for (i = 0; i < gltsUsed; i++)
    	    {
    	        // remove "i, true" after resolving a bug
    	        renderer.texture.bind(this.texResources[i].baseTex, i);
    	    }
    	}

    	start()
    	{
    	    // sorry, nothing
    	}

    	/**
    	 * @internal
    	 * @ignore
    	 */
    	createVb()
    	{
    	    const geom = new RectTileGeom();

    	    geom.addIndex(this.indexBuffer);
    	    geom.lastTimeAccess = Date.now();

    	    return geom;
    	}

    	/** @return The {@link TilemapShader} shader that this rendering pipeline is using. */
    	getShader() { return this.shader; }

    	destroy()
    	{
    	    super.destroy();
    	    // this.rectShader.destroy();
    	    this.shader = null;
    	}

    	 checkIndexBuffer(size, _vb = null)
    	{
    	    const totalIndices = size * 6;

    	    if (totalIndices <= this.ibLen)
    	    {
    	        return;
    	    }

    	    let len = totalIndices;

    	    while (len < totalIndices)
    	    {
    	        len <<= 1;
    	    }

    	    this.ibLen = totalIndices;
    	    this.indexBuffer.update(utils.createIndicesForQuads(size,
    	        Constant.use32bitIndex ? new Uint32Array(size * 6) : undefined));

    	    // 	TODO: create new index buffer instead?
    	    // if (vb) {
    	    // 	const curIndex = vb.getIndex();
    	    // 	if (curIndex !== this.indexBuffer && (curIndex.data as any).length < totalIndices) {
    	    // 		this.swapIndex(vb, this.indexBuffer);
    	    // 	}
    	    // }
    	}

    	 initBounds()
    	{
    	    if (Constant.boundCountPerBuffer <= 1)
    	    {
    	        return;
    	    }

    	    const maxTextures = Constant.maxTextures;

    	    for (let i = 0; i < maxTextures; i++)
    	    {
    	        const resource = new MultiTextureResource(Constant);
    	        const baseTex = new core.BaseTexture(resource);

    	        baseTex.scaleMode = Constant.SCALE_MODE;
    	        baseTex.wrapMode = constants.WRAP_MODES.CLAMP;
    	        this.texResources.push(resource);
    	    }
    	}

    	 bindTexturesWithoutRT(renderer, shader, textures)
    	{
    	    const samplerSize = (shader ).uniforms.uSamplerSize;

    		for (let i = 0; i < textures.length; i++)
    	    {
    	        const texture = textures[i];

    	        if (!texture || !texture.valid)
    	        {
    	            return;
    	        }

    			renderer.texture.bind(textures[i], i);
    	        // TODO: add resolution here
    	        samplerSize[i * 2] = 1.0 / textures[i].baseTexture.width;
    	        samplerSize[(i * 2) + 1] = 1.0 / textures[i].baseTexture.height;
    	    }
    	    (shader ).uniforms.uSamplerSize = samplerSize;
    	}
    }

    core.Renderer.registerPlugin('tilemap', TileRenderer );

    // eslint-disable-next-line camelcase
    const pixi_tilemap = {
        CanvasTileRenderer,
        CompositeRectTileLayer: CompositeTilemap,
        CompositeTilemap,
        Constant,
        MultiTextureResource,
        RectTileLayer: Tilemap,
        Tilemap,
        TilemapShader,
        RectTileShader,
        RectTileGeom,
        TileRenderer,
    };

    exports.CanvasTileRenderer = CanvasTileRenderer;
    exports.CompositeRectTileLayer = CompositeTilemap;
    exports.CompositeTilemap = CompositeTilemap;
    exports.Constant = Constant;
    exports.MultiTextureResource = MultiTextureResource;
    exports.POINT_STRUCT_SIZE = POINT_STRUCT_SIZE;
    exports.RectTileGeom = RectTileGeom;
    exports.RectTileLayer = Tilemap;
    exports.RectTileShader = RectTileShader;
    exports.TileRenderer = TileRenderer;
    exports.Tilemap = Tilemap;
    exports.TilemapShader = TilemapShader;
    exports.fillSamplers = fillSamplers;
    exports.generateFragmentSrc = generateFragmentSrc;
    exports.generateSampleSrc = generateSampleSrc;
    exports.pixi_tilemap = pixi_tilemap;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof pixi_tilemap !== 'undefined') { Object.assign(this.PIXI.tilemap, pixi_tilemap); }
//# sourceMappingURL=pixi-tilemap.umd.js.map
