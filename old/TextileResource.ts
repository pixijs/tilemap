import { BaseTexture, Renderer, Resource, Texture, GLTexture, ALPHA_MODES } from '@pixi/core';
import { settings } from '../src/settings';

export interface TextileOptions
{
    TEXTILE_DIMEN: number;
    TEXTILE_UNITS: number;
    DO_CLEAR?: boolean;
}

type TextureTile = {
    dirtyId: number;
    x: number;
    y: number;
    baseTexture: BaseTexture;
};

// For some reason, ESLint goes mad with indentation in this file ^&^
/* eslint-disable indent */

/**
 * This texture tiling resource can be used to upload multiple base-textures together.
 *
 * This resource combines multiple base-textures into a "textile". They're laid out in
 * a dual column format, placed in row-order order. The size of each tile is predefined,
 * and defaults to {@link settings.TEXTILE_DIMEN}. This means that each input base-texture
 * must is smaller than that along both its width and height.
 *
 * @see settings.TEXTILE_UNITS
 */
export class TextileResource extends Resource
{
    /** The base-texture that contains all the texture tiles. */
    public baseTexture: BaseTexture = null;

    private readonly doClear: boolean;
    private readonly tileDimen: number;
    private readonly tiles: Array<TextureTile>;

    private _clearBuffer: Uint8Array = null;

    /**
	 * @param options - This will default to the "settings" exported by @pixi/tilemap.
	 * @param options.TEXTILE_DIMEN - The dimensions of each tile.
	 * @param options.TEXTILE_UNITS - The number of texture tiles.
	 */
    constructor(options: TextileOptions = settings)
    {
        super(
            options.TEXTILE_DIMEN * 2,
            options.TEXTILE_DIMEN * Math.ceil(options.TEXTILE_UNITS / 2),
        );

        const tiles: TextureTile[] = this.tiles = new Array(options.TEXTILE_UNITS);

        this.doClear = !!options.DO_CLEAR;
        this.tileDimen = options.TEXTILE_DIMEN;

        for (let j = 0; j < options.TEXTILE_UNITS; j++)
        {
            tiles[j] = {
                dirtyId: 0,
                x: options.TEXTILE_DIMEN * (j & 1),
                y: options.TEXTILE_DIMEN * (j >> 1),
                baseTexture: Texture.WHITE.baseTexture,
            };
        }
    }

    /**
	 * Sets the texture to be uploaded for the given tile.
	 *
	 * @param index - The index of the tile being set.
	 * @param texture - The texture with the base-texture to upload.
	 */
    tile(index: number, texture: BaseTexture): void
    {
        const tile = this.tiles[index];

        if (tile.baseTexture === texture)
        {
            return;
        }

        tile.baseTexture = texture;
        this.baseTexture.update();

        this.tiles[index].dirtyId = (this.baseTexture as any).dirtyId;
    }

    /** @override */
    bind(baseTexture: BaseTexture): void
    {
        if (this.baseTexture)
        {
            throw new Error('Only one baseTexture is allowed for this resource!');
        }

        this.baseTexture = baseTexture;
        super.bind(baseTexture);
    }

    /** @override */
    upload(renderer: Renderer, texture: BaseTexture, glTexture: GLTexture): boolean
    {
        const { gl } = renderer;
        const { width, height } = this;

        gl.pixelStorei(
            gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
            texture.alphaMode === undefined || texture.alphaMode === ALPHA_MODES.UNPACK
        );

        if (glTexture.dirtyId < 0)
        {
            (glTexture as any).width = width;
            (glTexture as any).height = height;

            gl.texImage2D(texture.target, 0,
                texture.format,
                width,
                height,
                0,
                texture.format,
                texture.type,
                null);
        }

        const doClear = this.doClear;
        const tiles = this.tiles;

        if (doClear && !this._clearBuffer)
        {
            this._clearBuffer = new Uint8Array(settings.TEXTILE_DIMEN * settings.TEXTILE_DIMEN * 4);
        }

        for (let i = 0; i < tiles.length; i++)
        {
            const spr = tiles[i];
            const tex = spr.baseTexture;

            if (glTexture.dirtyId >= this.tiles[i].dirtyId)
            {
                continue;
            }

            const res = tex.resource as any;

            if (!tex.valid || !res || !res.source)
            {
                continue;
            }
            if (doClear && (tex.width < this.tileDimen || tex.height < this.tileDimen))
            {
                gl.texSubImage2D(texture.target, 0,
                    spr.x,
                    spr.y,
                    this.tileDimen,
                    this.tileDimen,
                    texture.format,
                    texture.type,
                    this._clearBuffer);
            }

            gl.texSubImage2D(texture.target, 0,
                spr.x,
                spr.y,
                texture.format,
                texture.type,
                res.source);
        }

        return true;
    }
}
