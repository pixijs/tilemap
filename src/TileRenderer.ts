import { WRAP_MODES } from '@pixi/constants';
import { BaseTexture, Buffer, ObjectRenderer, Renderer } from '@pixi/core';
import { settings } from './settings';
import { TilemapGeometry, TilemapShader } from './TilemapShader';
import { TextileResource } from './TextileResource';
import * as utils from '@pixi/utils';

// For some reason ESLint goes mad with indendation in this file ^&^
/* eslint-disable no-mixed-spaces-and-tabs, indent */

/**
 * Rendering helper pipeline for tilemaps. This plugin is registered automatically.
 */
export class TileRenderer extends ObjectRenderer
{
	/** The managing renderer */
	public readonly renderer: Renderer;

	/** The tile animation frame */
	public tileAnim = [0, 0];

	private ibLen = 0;// index buffer length

	/** The index buffer for the tilemaps to share. */
	private indexBuffer: Buffer = null;

	/** The shader used to render tilemaps. */
	private shader: TilemapShader;

	/**
	 * {@link TextileResource} instances used to upload textures batched in tiled groups. This is
	 * used only if {@link settings.TEXTURES_PER_TILEMAP} is greater than 1.
	 */
	private textiles: Array<TextileResource> = [];

	/** @param renderer - The managing renderer */
	constructor(renderer: Renderer)
	{
	    super(renderer);

	    this.shader = new TilemapShader(settings.TEXTURES_PER_TILEMAP);
	    this.indexBuffer = new Buffer(undefined, true, true);
	    this.checkIndexBuffer(2000);
	    this.makeTextiles();
	}

	/**
	 * Binds the tile textures to the renderer, and updates the tilemap shader's `uSamplerSize` uniform.
	 *
	 * If {@link settings.TEXTILE_UNITS}
	 *
	 * @param renderer - The renderer to which the textures are to be bound.
	 * @param textures - The tile textures being bound.
	 */
	bindTileTextures(renderer: Renderer, textures: Array<BaseTexture>): void
	{
	    const len = textures.length;
		const shader = this.shader;
	    const maxTextures = settings.TEXTURES_PER_TILEMAP;
		const samplerSize: Array<number> = shader.uniforms.uSamplerSize;

	    if (len > settings.TEXTILE_UNITS * maxTextures)
	    {
			// TODO: Show error message instead of silently failing!
	        return;
	    }

		if (settings.TEXTILE_UNITS <= 1)
	    {
			// Bind each texture directly & update samplerSize.
			for (let i = 0; i < textures.length; i++)
			{
				const texture = textures[i];

				if (!texture || !texture.valid)
				{
					return;
				}

				renderer.texture.bind(textures[i], i);

				samplerSize[i * 2] = 1.0 / textures[i].realWidth;
				samplerSize[(i * 2) + 1] = 1.0 / textures[i].realHeight;
			}
	    }
		else
		{
			// Ensure we have enough textiles, in case settings.TEXTILE_UNITS was modified.
			this.makeTextiles();

			const usedTextiles = Math.ceil(len / settings.TEXTILE_UNITS);

			// First ensure each textile has all tiles point to the right textures.
			for (let i = 0; i < len; i++)
			{
				const texture = textures[i];

				if (texture && texture.valid)
				{
					const resourceIndex = Math.floor(i / settings.TEXTILE_UNITS);
					const tileIndex = i % settings.TEXTILE_UNITS;

					this.textiles[resourceIndex].tile(tileIndex, texture);
				}
			}

			// Then bind the textiles + update samplerSize.
			for (let i = 0; i < usedTextiles; i++)
			{
				renderer.texture.bind(this.textiles[i].baseTexture, i);

				samplerSize[i * 2] = 1.0 / this.textiles[i].width;
				samplerSize[(i * 2) + 1] = 1.0 / this.textiles[i].baseTexture.height;
			}
		}

		shader.uniforms.uSamplerSize = samplerSize;
	}

	start(): void
	{
	    // sorry, nothing
	}

	/**
	 * @internal
	 * @ignore
	 */
	createVb(): TilemapGeometry
	{
	    const geom = new TilemapGeometry();

	    geom.addIndex(this.indexBuffer);
	    geom.lastTimeAccess = Date.now();

	    return geom;
	}

	/** @return The {@link TilemapShader} shader that this rendering pipeline is using. */
	getShader(): TilemapShader { return this.shader; }

	destroy(): void
	{
	    super.destroy();
	    // this.rectShader.destroy();
	    this.shader = null;
	}

	public checkIndexBuffer(size: number, _vb: TilemapGeometry = null): void
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
	        settings.use32bitIndex ? new Uint32Array(size * 6) : undefined));

	    // 	TODO: create new index buffer instead?
	    // if (vb) {
	    // 	const curIndex = vb.getIndex();
	    // 	if (curIndex !== this.indexBuffer && (curIndex.data as any).length < totalIndices) {
	    // 		this.swapIndex(vb, this.indexBuffer);
	    // 	}
	    // }
	}

	/** Makes textile resources and initializes {@link TileRenderer.textiles}. */
	private makeTextiles(): void
	{
	    if (settings.TEXTILE_UNITS <= 1)
	    {
	        return;
	    }

	    for (let i = 0; i < settings.TEXTILE_UNITS; i++)
	    {
			if (this.textiles[i]) continue;

			const resource = new TextileResource();
	        const baseTex = new BaseTexture(resource);

	        baseTex.scaleMode = settings.TEXTILE_SCALE_MODE;
	        baseTex.wrapMode = WRAP_MODES.CLAMP;

			this.textiles[i] = resource;
	    }
	}
}

Renderer.registerPlugin('tilemap', TileRenderer as any);
