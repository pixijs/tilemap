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

		static vbAutoincrement = 0;
		static snAutoincrement = 0;

		static SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
		static DO_CLEAR = false;

		renderer: PIXI.Renderer;
		gl: WebGLRenderingContext;
		sn: number = -1;
		indexBuffer: PIXI.Buffer = null;
		lastTimeCheck = 0;
		tileAnim = [0, 0];
		texLoc: Array<number> = [];

		rectShader: RectTileShader;
		boundSprites: Array<PIXI.Sprite>;
		glTextures: Array<PIXI.RenderTexture>;

		_clearBuffer: Uint8Array;

		constructor(renderer: PIXI.Renderer) {
			super(renderer);
			this.indexBuffer = new PIXI.Buffer(undefined, true, true);
			this.checkIndexBuffer(2000);
		}

		onContextChange() {
			const gl = this.renderer.gl;
			const maxTextures = Constant.maxTextures;

			this.sn = TileRenderer.snAutoincrement++;

			this.rectShader = new RectTileShader(gl, maxTextures);
			this.checkIndexBuffer(2000);
			this.rectShader.indexBuffer = this.indexBuffer;
			this.glTextures = [];
			this.boundSprites = [];
			this.initBounds();
		}

		initBounds() {
			if (Constant.boundCountPerBuffer <= 1) {
				return;
			}

			const gl = this.renderer.gl;
			const maxTextures = Constant.maxTextures;
			for (let i = 0; i < maxTextures; i++) {
				const rt = PIXI.RenderTexture.create(Constant.bufferSize, Constant.bufferSize);
				rt.baseTexture.premultipliedAlpha = true;
				rt.baseTexture.scaleMode = TileRenderer.SCALE_MODE;
				rt.baseTexture.wrapMode = PIXI.WRAP_MODES.CLAMP;
				this.renderer.textureManager.updateTexture(rt);

				this.glTextures.push(rt);
				const bounds = this.boundSprites;
				for (let j = 0; j < Constant.boundCountPerBuffer; j++) {
					const spr = new PIXI.Sprite();
					spr.position.x = Constant.boundSize * (j & 1);
					spr.position.y = Constant.boundSize * (j >> 1);
					bounds.push(spr);
				}
			}
		}

		bindTexturesWithoutRT(renderer: PIXI.WebGLRenderer, shader: TilemapShader, textures: Array<PIXI.Texture>) {
			const len = textures.length;
			const maxTextures = Constant.maxTextures;

			let samplerSize: Array<number> = shader.uniforms.uSamplerSize;
			this.texLoc.length = 0;
			for (let i = 0; i < textures.length; i++) {
				const texture = textures[i];
				if (!texture || !texture.valid) {
					return;
				}
				this.texLoc.push(renderer.bindTexture(textures[i], i, true))
				//TODO: add resolution here
				samplerSize[i * 2] = 1.0 / textures[i].baseTexture.width;
				samplerSize[i * 2 + 1] = 1.0 / textures[i].baseTexture.height;
			}
			shader.uniforms.uSamplerSize = samplerSize;
			shader.uniforms.uSamplers = this.texLoc;
		}

		bindTextures(renderer: PIXI.WebGLRenderer, shader: TilemapShader, textures: Array<PIXI.Texture>) {
			const len = textures.length;
			const maxTextures = Constant.maxTextures;
			if (len > Constant.boundCountPerBuffer * maxTextures) {
				return;
			}
			if (Constant.boundCountPerBuffer <= 1) {
				this.bindTexturesWithoutRT(renderer, shader, textures);
				return;
			}
			const doClear = TileRenderer.DO_CLEAR;
			if (doClear && !this._clearBuffer) {
				this._clearBuffer = new Uint8Array(Constant.boundSize * Constant.boundSize * 4);
			}
			const glts = this.glTextures;
			const bounds = this.boundSprites;

			const oldActiveRenderTarget = this.renderer._activeRenderTarget;

			let i: number;
			for (i = 0; i < len; i++) {
				const texture = textures[i];
				if (!texture || !texture.valid) continue;
				const bs = bounds[i];
				if (!bs.texture ||
					bs.texture.baseTexture !== texture.baseTexture) {
					bs.texture = texture;
					const glt = glts[i >> 2];
					renderer.bindTexture(glt, 0, true);
					if (doClear) {
						_hackSubImage((glt.baseTexture as any)._glTextures[renderer.CONTEXT_UID], bs, this._clearBuffer, Constant.boundSize, Constant.boundSize);
					} else {
						_hackSubImage((glt.baseTexture as any)._glTextures[renderer.CONTEXT_UID], bs);
					}
				}
			}

			// fix in case we are inside of filter or renderTexture
			if (!oldActiveRenderTarget.root) {
				this.renderer._activeRenderTarget.frameBuffer.bind();
			}

			this.texLoc.length = 0;
			var gltsUsed = (i + 3) >> 2;
			for (i = 0; i < gltsUsed; i++) {
				//remove "i, true" after resolving a bug
				this.texLoc.push(renderer.bindTexture(glts[i], i, true))
			}

			shader.uniforms.uSamplers = this.texLoc;
		}

		start() {
			this.renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
			//sorry, nothing
		}

		createVb() {
			const id = ++TileRenderer.vbAutoincrement;
			const shader = this.getShader();
			const gl = this.renderer.gl;

			this.renderer.bindVao(null);

			const vb = PIXI.glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
			const stuff = {
				id: id,
				vb: vb,
				vao: shader.createVao(this.renderer, vb),
				lastTimeAccess: Date.now(),
				shader: shader,
				rendererSN: this.sn
			};
			return stuff;
		}

		checkIndexBuffer(size: number) {
			const totalIndices = size * 6;

			if (totalIndices <= this.indexBuffer.data.length) {
				return;
			}

			//createIndicesForQuads

			let indices = this.indices;
			if (totalIndices <= indices.length) {
				return;
			}
			let len = indices.length || totalIndices;
			while (len < totalIndices) {
				len <<= 1;
			}

			this.indexBuffer.update((PIXI as any).createIndicesForQuads(size / 6));
		}

		getShader(): TilemapShader {
			return this.rectShader;
		}

		destroy() {
			super.destroy();
			this.rectShader.destroy();
			this.rectShader = null;
		}
	}

	PIXI.WebGLRenderer.registerPlugin('tilemap', TileRenderer);

}
