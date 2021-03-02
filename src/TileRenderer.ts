import { WRAP_MODES } from '@pixi/constants';
import { BaseTexture, Buffer, ObjectRenderer, Texture, Renderer } from '@pixi/core';
import { Constant } from './Constant';
import { RectTileGeom, RectTileShader } from './RectTileShader';
import { MultiTextureResource } from './MultiTextureResource';
import * as utils from '@pixi/utils';

import type { TilemapShader } from './RectTileShader';

/**
 * Renderer for rectangle tiles.
 */
export class TileRenderer extends ObjectRenderer
{
	renderer: Renderer;
	gl: WebGLRenderingContext;
	sn: number = -1;
	indexBuffer: Buffer = null;
	ibLen: number = 0;
	tileAnim = [0, 0];
	texLoc: Array<number> = [];

	rectShader: RectTileShader;
	texResources: Array<MultiTextureResource> = [];

	constructor(renderer: Renderer) {
		super(renderer);
		this.rectShader = new RectTileShader(Constant.maxTextures);
		this.indexBuffer = new Buffer(undefined, true, true);
		this.checkIndexBuffer(2000);
		this.initBounds();
	}

	initBounds() {
		if (Constant.boundCountPerBuffer <= 1) {
			return;
		}

		const maxTextures = Constant.maxTextures;
		for (let i = 0; i < maxTextures; i++) {
			const resource = new MultiTextureResource(Constant);
			const baseTex = new BaseTexture(resource);
			baseTex.scaleMode = Constant.SCALE_MODE;
			baseTex.wrapMode = WRAP_MODES.CLAMP;
			this.texResources.push(resource);
		}
	}

	bindTexturesWithoutRT(renderer: Renderer, shader: TilemapShader, textures: Array<Texture>) {
		let samplerSize: Array<number> = (shader as any).uniforms.uSamplerSize;
		this.texLoc.length = 0;
		for (let i = 0; i < textures.length; i++) {
			const texture = textures[i];
			if (!texture || !texture.valid) {
				return;
			}
			renderer.texture.bind(textures[i], i);
			//TODO: add resolution here
			samplerSize[i * 2] = 1.0 / textures[i].baseTexture.width;
			samplerSize[i * 2 + 1] = 1.0 / textures[i].baseTexture.height;
		}
		(shader as any).uniforms.uSamplerSize = samplerSize;
	}

	bindTextures(renderer: Renderer, shader: TilemapShader, textures: Array<Texture>) {
		const len = textures.length;
		const maxTextures = Constant.maxTextures;
		if (len > Constant.boundCountPerBuffer * maxTextures) {
			return;
		}
		if (Constant.boundCountPerBuffer <= 1) {
			this.bindTexturesWithoutRT(renderer, shader, textures);
			return;
		}

		let i = 0;
		for (; i < len; i++) {
			const texture = textures[i];
			if (!texture || !texture.valid) continue;
			const multi = this.texResources[i >> 2];
			multi.setTexture(i & 3, texture);
		}

		let gltsUsed = (i + 3) >> 2;
		for (i = 0; i < gltsUsed; i++) {
			//remove "i, true" after resolving a bug
			renderer.texture.bind(this.texResources[i].baseTex, i);
		}
	}

	start() {
		//sorry, nothing
	}

	createVb() {
		const geom = new RectTileGeom();
		geom.addIndex(this.indexBuffer);
		geom.lastTimeAccess = Date.now();
		return geom;
	}

	checkIndexBuffer(size: number, vb: RectTileGeom = null) {
		const totalIndices = size * 6;

		if (totalIndices <= this.ibLen) {
			return;
		}

		let len = totalIndices;
		while (len < totalIndices) {
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

	// swapIndex(geom: PIXI.Geometry, indexBuf: PIXI.Buffer) {
		// let buffers = (geom as any).buffers;
		// const oldIndex = geom.getIndex();
		// let ind = buffers.indexOf(oldIndex);
		// if (ind >= 0) {
		// 	buffers.splice(ind, 1);
		// }
		// geom.addIndex(indexBuf);
	// }

	getShader(): TilemapShader {
		return this.rectShader;
	}

	destroy() {
		super.destroy();
		// this.rectShader.destroy();
		this.rectShader = null;
	}
}

Renderer.registerPlugin('tilemap', TileRenderer as any);
