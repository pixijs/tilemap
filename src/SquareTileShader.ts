module PIXI.tilemap {

    import GLBuffer = PIXI.glCore.GLBuffer;
    import VertexArrayObject = PIXI.glCore.VertexArrayObject;

    var squareShaderVert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aAnim;
attribute float aTextureId;
attribute float aSize;

uniform mat3 projectionMatrix;
uniform vec2 samplerSize;
uniform vec2 animationFrame;
uniform float projectionScale;

varying vec2 vTextureCoord;
varying float vSize;
varying float vTextureId;

void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition + aSize * 0.5, 1.0)).xy, 0.0, 1.0);
   gl_PointSize = aSize * projectionScale;
   vTextureCoord = aTextureCoord + aAnim * animationFrame;
   vTextureId = aTextureId;
   vSize = aSize;
}
`;

    var squareShaderFrag = `
varying vec2 vTextureCoord;
varying float vSize;
varying float vTextureId;

uniform vec4 shadowColor;
uniform sampler2D uSamplers[%count%];
uniform vec2 uSamplerSize[%count%];
uniform vec2 pointScale;

void main(void){
   float margin = 0.5 / vSize;
   vec2 pointCoord = (gl_PointCoord - 0.5) * pointScale + 0.5;
   vec2 clamped = vec2(clamp(pointCoord.x, margin, 1.0 - margin), clamp(pointCoord.y, margin, 1.0 - margin));
   vec2 textureCoord = pointCoord * vSize + vTextureCoord;
   float textureId = vTextureId;
   vec4 color;
   %forloop%
   gl_FragColor = color;
}

`;

    export class SquareTileShader extends TilemapShader {
        vertSize = 8;
        vertPerQuad = 1;
        stride = this.vertSize * 4;

        constructor(gl: WebGLRenderingContext, maxTextures: number) {
            super(gl,
                maxTextures,
                squareShaderVert,
                shaderGenerator.generateFragmentSrc(maxTextures, squareShaderFrag)
            );
            this.maxTextures = maxTextures;
            shaderGenerator.fillSamplers(this, this.maxTextures);
        }

        indexBuffer: GLBuffer;

        createVao(renderer: WebGLRenderer, vb: GLBuffer): VertexArrayObject {
            var gl = renderer.gl;
            return renderer.createVao()
                .addIndex(this.indexBuffer)
                .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
                .addAttribute(vb, this.attributes.aTextureCoord, gl.FLOAT, false, this.stride, 2 * 4)
                .addAttribute(vb, this.attributes.aSize, gl.FLOAT, false, this.stride, 4 * 4)
                .addAttribute(vb, this.attributes.aAnim, gl.FLOAT, false, this.stride, 5 * 4)
                .addAttribute(vb, this.attributes.aTextureId, gl.FLOAT, false, this.stride, 7 * 4);
        };
    }
}