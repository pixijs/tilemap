import { Container, Bounds } from '@pixi/display';
import { Constant } from './const';
import { DRAW_MODES } from '@pixi/constants';
import { Texture, Renderer } from '@pixi/core';
import { TileRenderer } from './TileRenderer';
import { Matrix, Rectangle, groupD8 } from '@pixi/math';

import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { IDestroyOptions } from '@pixi/display';
import type { RectTileGeom } from './TilemapShader';

export const POINT_STRUCT_SIZE = 12;

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
export class Tilemap extends Container
{
    // zIndex to zero by DisplayObject
    modificationMarker = 0;
    shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
    _globalMat: Matrix = null;
    offsetX = 0;
    offsetY = 0;
    compositeParent = false;
    tileAnim: Array<number> = null;

    /**
     * The list of textures being used in the tilemap.
     *
     * This should not be shuffled after tiles have been added into this tilemap. Usually, only tile textures
     * should be added after tiles have been added into the map.
     */
    protected tileset: Array<Texture>;

    /**
     * The local bounds of the tilemap itself. This does not include DisplayObject children.
     */
    protected readonly tilemapBounds = new Bounds();

    /** Flags whether any animated tile was added. */
    protected hasAnimatedTile = false;

    /** The interleaved geometry of the tilemap. */
    private pointsBuf: Array<number> = [];

    /**
     * @param tileset - The tileset to use for the tilemap. This can be reset later with {@link Tilemap.setTileset}.
     */
    constructor(tileset: Texture | Array<Texture>);
    constructor(zIndex: number, textures: Texture | Array<Texture>);

    constructor(arg0: Texture | Array<Texture> | number, arg1?: Texture | Array<Texture>)
    {
        super();

        const zIndex = typeof arg0 === 'number' ? arg0 : 0;
        const tileset = typeof arg0 !== 'number' ? arg0 : arg1;

        this.zIndex = zIndex;
        this.setTileset(tileset);
    }

    /**
     * @returns The tileset of this tilemap.
     */
    getTileset(): Array<Texture>
    {
        return this.tileset;
    }

    /**
     * Define the tileset used by the tilemap.
     *
     * @param tileset - The list of textures to use in the tilemap. If a texture (not array) is passed, it will
     *  be wrapped into an array.
     */
    setTileset(tileset: Texture | Array<Texture> = []): this
    {
        if (!Array.isArray(tileset))
        {
            tileset = [tileset];
        }

        this.tileset = tileset;

        return this;
    }

    /**  Clears all the tiles added into this tilemap. */
    clear(): this
    {
        this.pointsBuf.length = 0;
        this.modificationMarker = 0;
        this.tilemapBounds.clear();
        this.hasAnimatedTile = false;

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
     * @param [options.animX=0] - For animated tiles, this is the "offset" along the x-axis for adjacent
     *      animation frame textures in the base-texture.
     * @param [options.animY=0] - For animated tiles, this is the "offset" along the y-axis for adjacent
     *      animation frames textures in the base-texture.
     * @param [options.rotate=0]
     * @param [options.animCountX=1024] - For animated tiles, this is the number of animation frame textures
     *      per row.
     * @param [options.animCountY=1024] - For animated tiles, this is the number of animation frame textures
     *      per column.
     * @return This tilemap, good for chaining.
     */
    tile(
        tileTexture: number | string | Texture,
        x: number,
        y: number,
        options: {
            u?: number,
            v?: number,
            tileWidth?: number,
            tileHeight?: number,
            animX?: number,
            animY?: number,
            rotate?: number,
            animCountX?: number,
            animCountY?: number
        }
    ): this
    {
        let texture: Texture;
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
                texture = Texture.from(tileTexture);
            }
            else
            {
                texture = tileTexture as Texture;
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

        this.hasAnimatedTile = this.hasAnimatedTile || animX > 0 || animY > 0;

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
    tileRotate(rotate: number): void
    {
        const pb = this.pointsBuf;

        // This seems off. Should be -6?
        pb[pb.length - 3] = rotate;
    }

    /** Changes the `animX`, `animCountX` of the last tile. */
    tileAnimX(offset: number, count: number): void
    {
        const pb = this.pointsBuf;

        pb[pb.length - 5] = offset;
        pb[pb.length - 2] = count;
    }

    /** Changes the `animY`, `animCountY` of the last tile. */
    tileAnimY(offset: number, count: number): void
    {
        const pb = this.pointsBuf;

        pb[pb.length - 4] = offset;
        pb[pb.length - 1] = count;
    }

    renderCanvas(renderer: CanvasRenderer): void
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

    renderCanvasCore(renderer: CanvasRenderer): void
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
                    (this.tileset[textureIndex].baseTexture as any).getDrawableSource(),
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

    private vbId = 0;
    private vb: RectTileGeom = null;
    private vbBuffer: ArrayBuffer = null;
    private vbArray: Float32Array = null;
    private vbInts: Uint32Array = null;

    private destroyVb(): void
    {
        if (this.vb)
        {
            this.vb.destroy();
            this.vb = null;
        }
    }

    render(renderer: Renderer): void
    {
        const plugin = (renderer.plugins as any).tilemap;
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

    renderWebGLCore(renderer: Renderer, plugin: TileRenderer): void
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
            this.vbId = (vb as any).id;
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
            let shiftU: number = this.offsetX;
            let shiftV: number = this.offsetY;

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

                let u0: number;
                let v0: number; let u1: number;
                let v1: number; let u2: number;
                let v2: number; let u3: number;
                let v3: number;

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

                    rotate = groupD8.add(rotate, groupD8.NW);
                    u0 = cX + (w2 * groupD8.uX(rotate));
                    v0 = cY + (h2 * groupD8.uY(rotate));

                    rotate = groupD8.add(rotate, 2); // rotate 90 degrees clockwise
                    u1 = cX + (w2 * groupD8.uX(rotate));
                    v1 = cY + (h2 * groupD8.uY(rotate));

                    rotate = groupD8.add(rotate, 2);
                    u2 = cX + (w2 * groupD8.uX(rotate));
                    v2 = cY + (h2 * groupD8.uY(rotate));

                    rotate = groupD8.add(rotate, 2);
                    u3 = cX + (w2 * groupD8.uX(rotate));
                    v3 = cY + (h2 * groupD8.uY(rotate));
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

        (renderer.geometry as any).bind(vb, shader);
        renderer.geometry.draw(DRAW_MODES.TRIANGLES, rectsCount * 6, 0);
    }

    /**
     * @internal
     * @ignore
     */
    isModified(anim: boolean): boolean
    {
        if (this.modificationMarker !== this.pointsBuf.length
            || (anim && this.hasAnimatedTile))
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
    clearModify(): void
    {
        this.modificationMarker = this.pointsBuf.length;
    }

    /** @override */
    protected _calculateBounds(): void
    {
        const { minX, minY, maxX, maxY } = this.tilemapBounds;

        this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
    }

    /** @override */
    public getLocalBounds(rect?: Rectangle): Rectangle
    {
        // we can do a fast local bounds if the sprite has no children!
        if (this.children.length === 0)
        {
            return this.tilemapBounds.getRectangle(rect);
        }

        return super.getLocalBounds.call(this, rect);
    }

    /** @override */
    destroy(options?: IDestroyOptions): void
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
    initialize(zIndex: number, textures: Texture | Array<Texture>): void
    {
        this.zIndex = zIndex || 0;
        this.setTileset(textures);
    }

    /**
     * Deprecated signature for {@link Tilemap.tile tile}.
     *
     * @deprecated Since @pixi/tilemap 3.
     */
    addFrame(texture: Texture | string | number, x: number, y: number, animX: number, animY: number): boolean
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
        textureIndex: number,
        u: number,
        v: number,
        x: number,
        y: number,
        tileWidth: number,
        tileHeight: number,
        animX = 0,
        animY = 0,
        rotate = 0,
        animCountX = 1024,
        animCountY = 1024
    ): this
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
