namespace pixi_tilemap {

    import glCore = PIXI.glCore;

    function _hackSubImage(tex: glCore.GLTexture, sprite: PIXI.Sprite, clearBuffer?: Uint8Array, clearWidth?: number, clearHeight?: number) {
        const gl = tex.gl;
        const baseTex = sprite.texture.baseTexture;
        if (clearBuffer && clearWidth > 0 && clearHeight > 0)
        {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, sprite.position.x, sprite.position.y, clearWidth, clearHeight, tex.format, tex.type, clearBuffer);
        }
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, sprite.position.x, sprite.position.y, tex.format, tex.type, baseTex.source as HTMLImageElement);
    }

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
        static SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
        static DO_CLEAR = false;
        renderer: PIXI.WebGLRenderer;
        gl: WebGLRenderingContext;
        vbs:  { [key: string]: any; } = {};
        indices = new Uint16Array(0);
        indexBuffer: glCore.GLBuffer;
        lastTimeCheck = 0;
        tileAnim = [0, 0];
        texLoc: Array<number> = [];

        rectShader: RectTileShader;
        boundSprites: Array<PIXI.Sprite>;
        glTextures: Array<PIXI.RenderTexture>;

        _clearBuffer: Uint8Array;

        constructor(renderer: PIXI.WebGLRenderer) {
            super(renderer)
        }

        onContextChange() {
            const gl = this.renderer.gl;
            const maxTextures = Constant.maxTextures;
            this.rectShader = new RectTileShader(gl, maxTextures);
            this.checkIndexBuffer(2000);
            this.rectShader.indexBuffer = this.indexBuffer;
            this.vbs = {};
            this.glTextures = [];
            this.boundSprites = [];
            this.initBounds();
        }

        initBounds() {
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

        bindTextures(renderer: PIXI.WebGLRenderer, shader: TilemapShader, textures: Array<PIXI.Texture>) {
            const len = textures.length;
            const maxTextures = Constant.maxTextures;
            if (len > Constant.boundCountPerBuffer * maxTextures) {
                return;
            }
            const doClear = TileRenderer.DO_CLEAR;
            if (doClear && !this._clearBuffer) {
                this._clearBuffer = new Uint8Array(Constant.boundSize * Constant.boundSize * 4);
            }
            const glts = this.glTextures;
            const bounds = this.boundSprites;

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

            var gltsUsed = i >> 2;
            this.texLoc.length = 0;
            for (i = 0; i <= gltsUsed; i++) {
                //remove "i, true" after resolving a bug
                this.texLoc.push(renderer.bindTexture(glts[i], i, true))
            }
            shader.uniforms.uSamplers = this.texLoc;
        }

        checkLeaks() {
            const now = Date.now();
            const old = now - 10000;
            if (this.lastTimeCheck < old ||
                this.lastTimeCheck > now) {
                this.lastTimeCheck = now;
                const vbs = this.vbs;
                for (let key in vbs) {
                    if (vbs[key].lastTimeAccess < old) {
                        this.removeVb(key);
                    }
                }
            }
        }

        start() {
            this.renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
            //sorry, nothing
        }

        getVb(id: string) {
            this.checkLeaks();
            const vb = this.vbs[id];
            if (vb) {
                vb.lastAccessTime = Date.now();
                return vb;
            }
            return null;
        }

        createVb() {
            const id = ++TileRenderer.vbAutoincrement;
            const shader = this.getShader();
            const gl = this.renderer.gl;
            const vb = PIXI.glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
            const stuff = {
                id: id,
                vb: vb,
                vao: shader.createVao(this.renderer, vb),
                lastTimeAccess: Date.now(),
                shader: shader
            };
            this.vbs[id] = stuff;
            return stuff;
        }

        removeVb(id: string) {
            if (this.vbs[id]) {
                this.vbs[id].vb.destroy();
                this.vbs[id].vao.destroy();
                delete this.vbs[id];
            }
        }

        checkIndexBuffer(size: number) {
            // the total number of indices in our array, there are 6 points per quad.
            const totalIndices = size * 6;
            let indices = this.indices;
            if (totalIndices <= indices.length) {
                return;
            }
            let len = indices.length || totalIndices;
            while (len < totalIndices) {
                len <<= 1;
            }

            indices = new Uint16Array(len);
            this.indices = indices;

            // fill the indices with the quads to draw
            for (let i = 0, j = 0; i + 5 < indices.length; i += 6, j += 4) {
                indices[i + 0] = j + 0;
                indices[i + 1] = j + 1;
                indices[i + 2] = j + 2;
                indices[i + 3] = j + 0;
                indices[i + 4] = j + 2;
                indices[i + 5] = j + 3;
            }

            if (this.indexBuffer) {
                this.indexBuffer.upload(indices);
            } else {
                let gl = this.renderer.gl;
                this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);
            }
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
