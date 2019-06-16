namespace pixi_tilemap {
	export interface IMultiTextureOptions {
		boundCountPerBuffer: number;
		boundSize: number;
		bufferSize: number;
	}

	export class MultiTextureResource extends PIXI.resources.Resource {
		constructor(options: IMultiTextureOptions) {
			super(options.bufferSize, options.bufferSize);

			const bounds = this.boundSprites;
			const dirties = this.dirties;
			for (let j = 0; j < options.boundCountPerBuffer; j++) {
				const spr = new PIXI.Sprite();
				spr.position.x = options.boundSize * (j & 1);
				spr.position.y = options.boundSize * (j >> 1);
				bounds.push(spr);
				dirties.push(0);
			}
		}

		bind(baseTexture: PIXI.BaseTexture) {
			if (this.baseTex) {
				throw new Error('Only one baseTexture is allowed for this resource!')
			}
			this.baseTex = baseTexture;
		}

		baseTex: PIXI.BaseTexture = null;
		boundSprites: Array<PIXI.Sprite> = [];
		dirties: Array<number> = [];

		setTexture(ind: number, baseTexture: PIXI.BaseTexture) {
			const spr = this.boundSprites[ind];
			if (spr.texture.baseTexture === baseTexture) {
				return;
			}
			spr.texture = baseTexture;
			this.dirties[ind] = this.baseTex;
			this.baseTex.update();
		}

		upload(renderer: PIXI.Renderer, texture: PIXI.BaseTexture, glTexture: PIXI.GLTexture) {
			const {gl} = renderer;

			const {width, height} = this;

			if (glTexture.dirtyId < 0) {
				glTexture.width = width;
				glTexture.height = height;

				gl.texImage2D(texture.target, 0,
					texture.format,
					width,
					height,
					0,
					texture.format,
					texture.type,
					null);
			}

			const bounds = this.boundSprites;
			for (let i = 0; i < bounds.length; i++) {
				const spr = bounds[i];
				const tex = spr.texture.baseTexture;
				if (glTexture.dirtyId >= this.dirties[i]) {
					continue;
				}
				if (!tex.valid || !tex.resource.source) {
					continue;
				}
				gl.texSubImage2D(texture.target, 0,
					spr.position.x,
					spr.position.y,
					texture.format,
					texture.type,
					tex.resource.source);
			}
		}
	}
}