function RectTileShader(gl)
{
    PIXI.Shader.call(this, gl,
        [
            'precision lowp float;',
            'attribute vec4 aVertexPosition;',
            'attribute vec2 aAnim;',

            'uniform mat3 projectionMatrix;',
            'uniform vec2 samplerSize;',
            'uniform vec2 animationFrame;',

            'varying vec2 vTextureCoord;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition.xy, 1.0)).xy, 0.0, 1.0);',
            '   vTextureCoord = (aVertexPosition.zw + aAnim * animationFrame ) * samplerSize;',
            '}'
        ].join('\n'),
        [
            'precision lowp float;',
            'varying vec2 vTextureCoord;',
            'uniform sampler2D uSampler;',
            'void main(void){',
            '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
            '}'
        ].join('\n')
    );
    this.vertSize = 6;
    this.vertPerQuad = 6;
    this.stride = this.vertSize * 4;
}

RectTileShader.prototype = Object.create(PIXI.Shader.prototype);
RectTileShader.prototype.constructor = RectTileShader;
RectTileShader.prototype.createVao = function (renderer, vb) {
    var gl = renderer.gl;
    return renderer.createVao()
        .addIndex(this.indexBuffer)
        .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
        .addAttribute(vb, this.attributes.aAnim, gl.FLOAT, false, this.stride, 4 * 4);
};

module.exports = RectTileShader;
