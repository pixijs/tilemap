namespace pixi_tilemap {
	/*
	 * Renderer for rectangle tiles.
	 *
	 * @class
	 * @memberof PIXI.tilemap
	 * @extends PIXI.ObjectRenderer
	 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
	 */

	export class TileRenderer extends PIXI.ObjectRenderer {
		renderer: PIXI.Renderer;
		gl: WebGLRenderingContext;
		sn: number = -1;
		indexBuffer: PIXI.Buffer = null;
		ibLen: number = 0;
		tileAnim = [0, 0];
		texLoc: Array<number> = [];

		rectShader: RectTileShader;
		texResources: Array<MultiTextureResource> = [];

		constructor(renderer: PIXI.Renderer) {
			super(renderer);
			this.indexBuffer = new PIXI.Buffer(undefined, true, true);
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
				const baseTex = new PIXI.BaseTexture(resource);
				baseTex.scaleMode = Constant.SCALE_MODE;
				baseTex.wrapMode = PIXI.WRAP_MODES.CLAMP;
				this.texResources.push(resource);
			}
		}

		bindTexturesWithoutRT(renderer: PIXI.Renderer, shader: TilemapShader, textures: Array<PIXI.Texture>) {
			let samplerSize: Array<number> = shader.uniforms.uSamplerSize;
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
			shader.uniforms.uSamplerSize = samplerSize;
		}

		bindTextures(renderer: PIXI.Renderer, shader: TilemapShader, textures: Array<PIXI.Texture>) {
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
				multi.setTexture(i, texture);
			}

			let gltsUsed = (i + 3) >> 2;
			for (i = 0; i < gltsUsed; i++) {
				//remove "i, true" after resolving a bug
				renderer.texture.bind(this.texResources[i].baseTex, i);
			}
		}

		start() {
			this.renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
			this.renderer.shader.bind(this.getShader(), false);
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

			this.ibLen = size;
			this.indexBuffer.update((PIXI as any).createIndicesForQuads(size / 6, Constant.use32bitIndex));

			if (vb) {
				const curIndex = vb.getIndex();
				if (curIndex !== this.indexBuffer && (curIndex.data as any).length < totalIndices) {
					this.swapIndex(vb, this.indexBuffer);
				}
			}
		}

		swapIndex(geom: PIXI.Geometry, indexBuf: PIXI.Buffer) {
			//TODO: dispose old index buffers?
			let buffers = (geom as any).buffers;
			const oldIndex = geom.getIndex();
			let ind = buffers.indexOf(oldIndex);
			if (ind >= 0) {
				buffers.splice(ind, 1);
			}
			geom.addIndex(indexBuf);
		}

		getShader(): TilemapShader {
			return this.rectShader;
		}

		destroy() {
			super.destroy();
			// this.rectShader.destroy();
			this.rectShader = null;
		}
	}

	PIXI.Renderer.registerPlugin('tilemap', TileRenderer as any);
}
