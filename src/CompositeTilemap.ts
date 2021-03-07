import { Container } from '@pixi/display';
import { Texture, Renderer } from '@pixi/core';
import { Matrix } from '@pixi/math';
import { Tilemap } from './Tilemap';
import { settings } from './settings';

import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { TileRenderer } from './TileRenderer';

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
export class CompositeTilemap extends Container
{
    /** The hard limit on the number of tile textures used in each tilemap. */
    public readonly texturesPerTilemap: number;

    /** The animation parameters */
    public tileAnim: Array<number> = null;

    /** The last modified tilemap. */
    protected lastModifiedTilemap: Tilemap = null;

    private modificationMarker = 0;
    private shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
    private _globalMat: Matrix = null;

    /**
     * @param tileset - A list of tile textures that will be used to eagerly initialized the layered
     *  tilemaps. This is only an performance optimization, and using {@link CompositeTilemap.tile tile}
     *  will work equivalently.
     * @param texturesPerTilemap - A custom limit on the number of tile textures used in each tilemap.
     */
    constructor(tileset?: Array<Texture>, texturesPerTilemap?: number);

    // @deprecated
    constructor(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number);

    constructor(bitmaps?: Array<Texture> | number, texPerChild?: Array<Texture> | number, arg2?: number)
    {
        super();

        const zIndex = typeof bitmaps === 'number' ? bitmaps : 0;
        // eslint-disable-next-line no-nested-ternary
        const tileset = Array.isArray(bitmaps) ? bitmaps : (Array.isArray(texPerChild) ? texPerChild : null);
        const texturesPerTilemap = typeof texPerChild === 'number' ? texPerChild : arg2;

        this.zIndex = zIndex;
        this.tileset(tileset);
        this.texturesPerTilemap = texturesPerTilemap || settings.TEXTILE_UNITS * settings.TEXTURES_PER_TILEMAP;
    }

    /**
     * This will preinitialize the tilesets of the layered tilemaps.
     *
     * If used after a tilemap has been created (or a tile added), this will overwrite the tile textures of the
     * existing tilemaps. Passing the tileset to the constructor instead is the best practice.
     *
     * @param tileTextures - The list of tile textures that make up the tileset.
     */
    tileset(tileTextures: Array<Texture>): this
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

        for (let i = 0; i < Math.min(len1, len2); i++)
        {
            (this.children[i] as Tilemap).setTileset(
                tileTextures.slice(i * texPerChild, (i + 1) * texPerChild)
            );
        }
        for (let i = len1; i < len2; i++)
        {
            const layer = new Tilemap(this.zIndex, tileTextures.slice(i * texPerChild, (i + 1) * texPerChild));

            layer.compositeParent = true;
            layer.offsetX = settings.TEXTILE_DIMEN;
            layer.offsetY = settings.TEXTILE_DIMEN;

            this.addChild(layer);
        }

        return this;
    }

    /** Clears the tilemap composite. */
    clear(): this
    {
        for (let i = 0; i < this.children.length; i++)
        {
            (this.children[i] as Tilemap).clear();
        }

        this.modificationMarker = 0;

        return this;
    }

    /** Changes the rotation of the last added tile. */
    tileRotate(rotate: number): this
    {
        if (this.lastModifiedTilemap)
        {
            this.lastModifiedTilemap.tileRotate(rotate);
        }

        return this;
    }

    /** Changes `animX`, `animCountX` of the last added tile. */
    tileAnimX(offset: number, count: number): this
    {
        if (this.lastModifiedTilemap)
        {
            this.lastModifiedTilemap.tileAnimX(offset, count);
        }

        return this;
    }

    /** Changes `animY`, `animCountY` of the last added tile. */
    tileAnimY(offset: number, count: number): this
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
        texture_: Texture | string | number,
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
        } = {}
    ): this
    {
        let texture: Texture;
        let layer: Tilemap = null;
        let ind  = 0;
        const children = this.children;

        this.lastModifiedTilemap = null;

        if (typeof texture_ === 'number')
        {
            const childIndex = texture_ / this.texturesPerTilemap >> 0;

            layer = children[childIndex] as Tilemap;

            if (!layer)
            {
                layer = children[0] as Tilemap;
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
                texture = Texture.from(texture_);
            }
            else
            {
                texture = texture_ as Texture;
            }

            for (let i = 0; i < children.length; i++)
            {
                const child = children[i] as Tilemap;
                const tex = child.getTileset();

                for (let j = 0; j < tex.length; j++)
                {
                    if (tex[j] === texture)
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
                    const child = children[i] as Tilemap;

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
                    layer.offsetX = settings.TEXTILE_DIMEN;
                    layer.offsetY = settings.TEXTILE_DIMEN;
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

    renderCanvas(renderer: CanvasRenderer): void
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
            const layer = (layers[i] as Tilemap);

            layer.tileAnim = this.tileAnim;
            layer.renderCanvasCore(renderer);
        }
    }

    render(renderer: Renderer): void
    {
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        const plugin = renderer.plugins.tilemap as TileRenderer;
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
            (layers[i] as Tilemap).renderWebGLCore(renderer, plugin);
        }
    }

    /**
     * @internal
     * @ignore
     */
    isModified(anim: boolean): boolean
    {
        const layers = this.children;

        if (this.modificationMarker !== layers.length)
        {
            return true;
        }
        for (let i = 0; i < layers.length; i++)
        {
            if ((layers[i] as Tilemap).isModified(anim))
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
    clearModify(): void
    {
        const layers = this.children;

        this.modificationMarker = layers.length;
        for (let i = 0; i < layers.length; i++)
        {
            (layers[i] as Tilemap).clearModify();
        }
    }

    /**
     * @deprecated Since @pixi/tilemap 3.
     * @see CompositeTilemap.tile
     */
    addFrame(
        texture: Texture | string | number,
        x: number,
        y: number,
        animX?: number,
        animY?: number,
        animWidth?: number,
        animHeight?: number
    ): this
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
        textureIndex: number,
        u: number,
        v: number,
        x: number,
        y: number,
        tileWidth: number,
        tileHeight: number,
        animX?: number,
        animY?: number,
        rotate?: number,
        animWidth?: number,
        animHeight?: number
    ): this
    {
        const childIndex: number = textureIndex / this.texturesPerTilemap >> 0;
        const textureId: number = textureIndex % this.texturesPerTilemap;

        if (this.children[childIndex] && (this.children[childIndex] as Tilemap).getTileset())
        {
            this.lastModifiedTilemap = (this.children[childIndex] as Tilemap);
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
    initialize(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number): void
    {
        if (texPerChild as any === true)
        {
            // old format, ignore it!
            texPerChild = 0;
        }

        this.zIndex = zIndex;
        (this as any).texturesPerTilemap = texPerChild || settings.TEXTILE_UNITS * settings.TEXTURES_PER_TILEMAP;

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
    setBitmaps = this.tileset;

    /**
     * @deprecated Since @pixi/tilemap 3.
     * @readonly
     * @see CompositeTilemap.texturesPerTilemap
     */
    get texPerChild(): number { return this.texturesPerTilemap; }
}
