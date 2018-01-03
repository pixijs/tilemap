/// <reference path="TileRenderer.ts" />

namespace pixi_tilemap {

    import glCore = PIXI.glCore;

    /*
     * Renderer for rectangle tiles.
     *
     * @class
     * @memberof PIXI.tilemap
     * @extends PIXI.ObjectRenderer
     * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
     */

    export class SimpleTileRenderer extends TileRenderer {

        constructor(renderer: PIXI.WebGLRenderer) {
            super(renderer)
        }

        samplerSize: Array<number> = [];

        onContextChange() {
            const gl = this.renderer.gl;
            this.rectShader = new RectTileShader(gl, 1);
            this.checkIndexBuffer(2000);
            this.rectShader.indexBuffer = this.indexBuffer;
            this.vbs = {};
        }

        bindTextures(renderer: PIXI.WebGLRenderer, shader: TilemapShader, textures: Array<PIXI.Texture>) {
            const len = textures.length;

            let i: number;
            for (i = 0; i < len; i++) {
                const texture = textures[i];

                if (!texture || !texture.valid) {
                    continue;
                }

                this.texLoc[0] = renderer.bindTexture(texture, 0, true);
                shader.uniforms.uSamplers = this.texLoc;

                this.samplerSize[0] = 1.0 / texture.baseTexture.width;
                this.samplerSize[1] = 1.0 / texture.baseTexture.height;
                shader.uniforms.uSamplerSize = this.samplerSize;

                break;
            }
        }

        destroy() {
            super.destroy();
        }
    }

    PIXI.WebGLRenderer.registerPlugin('simpleTilemap', SimpleTileRenderer);

}
