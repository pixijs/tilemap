namespace pixi_tilemap {

    import GLBuffer = PIXI.glCore.GLBuffer;
    import VertexArrayObject = PIXI.glCore.VertexArrayObject;

    var rectShaderFrag = `
varying vec2 vTextureCoord;
varying vec4 vFrame;
varying float vTextureId;
uniform vec4 shadowColor;
uniform sampler2D uSamplers[%count%];
uniform vec2 uSamplerSize[%count%];

void main(void){
   vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);
   float textureId = floor(vTextureId + 0.5);

   vec4 color;
   %forloop%
   gl_FragColor = color;
}
`;

    var rectShaderVert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aFrame;
attribute vec2 aAnim;
attribute float aTextureId;
attribute float aAnimWidth;
attribute float aAnimHeight;

uniform mat3 projectionMatrix;
uniform vec2 animationFrame;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vFrame;

void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vec2 anim = aAnim * mod(animationFrame + 1.0, vec2(aAnimWidth, aAnimHeight));
   vTextureCoord = aTextureCoord + anim;
   vFrame = aFrame + vec4(anim, anim);
   vTextureId = aTextureId;
}
`;

    export abstract class TilemapShader extends PIXI.Shader {

        maxTextures = 0;
        indexBuffer: GLBuffer;

        constructor(gl: WebGLRenderingContext, maxTextures: number, shaderVert: string, shaderFrag: string) {
            super(gl,
                shaderVert,
                shaderFrag
            );
            this.maxTextures = maxTextures;
            shaderGenerator.fillSamplers(this, this.maxTextures);
        }

        abstract createVao(renderer: PIXI.WebGLRenderer, vb: GLBuffer): VertexArrayObject;
    }

    export class RectTileShader extends TilemapShader {
        vertSize = pixi_tilemap.POINT_STRUCT_SIZE + 1;
        vertPerQuad = 4;
        stride = this.vertSize * 4;

        constructor(gl: WebGLRenderingContext, maxTextures: number) {
            super(gl,
                maxTextures,
                rectShaderVert,
                shaderGenerator.generateFragmentSrc(maxTextures, rectShaderFrag)
            );
            shaderGenerator.fillSamplers(this, this.maxTextures);
        }

        createVao(renderer: PIXI.WebGLRenderer, vb: GLBuffer) {
            var gl = renderer.gl;
            return renderer.createVao()
                .addIndex(this.indexBuffer)
                .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
                .addAttribute(vb, this.attributes.aTextureCoord, gl.FLOAT, false, this.stride, 2 * 4)
                .addAttribute(vb, this.attributes.aFrame, gl.FLOAT, false, this.stride, 4 * 4)
                .addAttribute(vb, this.attributes.aAnim, gl.FLOAT, false, this.stride, 8 * 4)
                .addAttribute(vb, this.attributes.aTextureId, gl.FLOAT, false, this.stride, 10 * 4)
                .addAttribute(vb, this.attributes.aAnimWidth, gl.FLOAT, false, this.stride, 11 * 4)
                .addAttribute(vb, this.attributes.aAnimHeight, gl.FLOAT, false, this.stride, 12 * 4);
        }
    }

}
