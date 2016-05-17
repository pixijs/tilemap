function SquareTileShader(gl) {
    PIXI.Shader.call(this, gl,
        [
            'attribute vec4 aVertexPosition;',
            'attribute vec3 aSize;',

            'uniform mat3 projectionMatrix;',
            'uniform vec2 samplerSize;',
            'uniform vec2 animationFrame;',
            'uniform float projectionScale;',

            'varying vec2 vTextureCoord;',
            'varying float vSize;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition.xy + aSize.x * 0.5, 1.0)).xy, 0.0, 1.0);',
            '   gl_PointSize = aSize.x * projectionScale;',
            '   vTextureCoord = (aVertexPosition.zw + aSize.yz * animationFrame ) * samplerSize;',
            '   vSize = aSize.x;',
            '}'
        ].join("\n"),
        [
            'varying vec2 vTextureCoord;',
            'varying float vSize;',
            'uniform vec2 samplerSize;',

            'uniform sampler2D uSampler;',
            'uniform vec2 pointScale;',

            'void main(void){',
            '   float margin = 0.5/vSize;',
            '   vec2 clamped = vec2(clamp(gl_PointCoord.x, margin, 1.0 - margin), clamp(gl_PointCoord.y, margin, 1.0 - margin));',
            '   gl_FragColor = texture2D(uSampler, ((clamped-0.5) * pointScale + 0.5) * vSize * samplerSize + vTextureCoord);',
            '}'
        ].join('\n')
    );
    this.vertSize = 7;
    this.vertPerQuad = 1;
    this.stride = this.vertSize * 4;
}

SquareTileShader.prototype = Object.create(PIXI.Shader.prototype);
SquareTileShader.prototype.constructor = SquareTileShader;
SquareTileShader.prototype.createVao = function (renderer, vb) {
    var gl = renderer.gl;
    return renderer.createVao()
        .addIndex(this.indexBuffer)
        .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
        .addAttribute(vb, this.attributes.aSize, gl.FLOAT, false, this.stride, 4 * 4);
};

module.exports = SquareTileShader;
