import { WRAP_MODES } from '@pixi/constants';
import { BaseTexture, Buffer, ObjectRenderer, Texture, Renderer } from '@pixi/core';
import { Constant } from './const';
import { RectTileGeom, RectTileShader } from './TilemapShader';
import { MultiTextureResource } from './MultiTextureResource';
import * as utils from '@pixi/utils';

import type { TilemapShader } from './TilemapShader';

// For some reason ESLint goes mad with indendation in this file ^&^
/* eslint-disable no-mixed-spaces-and-tabs, indent */

/** Rendering helper pipeline for tilemaps. */
export class TileRenderer extends ObjectRenderer
{
	/** The managing renderer */
	public readonly renderer: Renderer;

	/** The tile animation frame */
	public tileAnim = [0, 0];

	private ibLen = 0;// index buffer length
	private indexBuffer: Buffer = null;
	private shader: RectTileShader;
	private texResources: Array<MultiTextureResource> = [];

	/** @param renderer - The managing renderer */
	constructor(renderer: Renderer)
	{
	    super(renderer);
	    this.shader = new RectTileShader(Constant.maxTextures);
	    this.indexBuffer = new Buffer(undefined, true, true);
	    this.checkIndexBuffer(2000);
	    this.initBounds();
	}

	/**
	 * This internal method is used to bind tile textures.
	 *
	 * This method has some undocumented performance characteristics.
	 */
	bindTextures(renderer: Renderer, shader: TilemapShader, textures: Array<Texture>): void
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

	start(): void
	{
	    // sorry, nothing
	}

	/**
	 * @internal
	 * @ignore
	 */
	createVb(): RectTileGeom
	{
	    const geom = new RectTileGeom();

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

	public checkIndexBuffer(size: number, _vb: RectTileGeom = null): void
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

	private initBounds(): void
	{
	    if (Constant.boundCountPerBuffer <= 1)
	    {
	        return;
	    }

	    const maxTextures = Constant.maxTextures;

	    for (let i = 0; i < maxTextures; i++)
	    {
	        const resource = new MultiTextureResource(Constant);
	        const baseTex = new BaseTexture(resource);

	        baseTex.scaleMode = Constant.SCALE_MODE;
	        baseTex.wrapMode = WRAP_MODES.CLAMP;
	        this.texResources.push(resource);
	    }
	}

	private bindTexturesWithoutRT(renderer: Renderer, shader: TilemapShader, textures: Array<Texture>): void
	{
	    const samplerSize: Array<number> = (shader as any).uniforms.uSamplerSize;

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
	    (shader as any).uniforms.uSamplerSize = samplerSize;
	}
}

Renderer.registerPlugin('tilemap', TileRenderer as any);
