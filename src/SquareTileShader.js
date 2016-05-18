var glslify  = require('glslify'), shaderGenerator = require('./shaderGenerator');


function SquareTileShader(gl, maxTextures) {
    PIXI.Shader.call(this, gl,
        glslify('./square.vert', 'utf8'),
        shaderGenerator.generateFragmentSrc(maxTextures, glslify('./square.frag', 'utf8'))
    );
    this.maxTextures = maxTextures;
    this.vertSize = 8;
    this.vertPerQuad = 1;
    this.stride = this.vertSize * 4;
    shaderGenerator.fillSamplers(this, this.maxTextures);
}

SquareTileShader.prototype = Object.create(PIXI.Shader.prototype);
SquareTileShader.prototype.constructor = SquareTileShader;
SquareTileShader.prototype.createVao = function (renderer, vb) {
    var gl = renderer.gl;
    return renderer.createVao()
        .addIndex(this.indexBuffer)
        .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
        .addAttribute(vb, this.attributes.aTextureCoord, gl.FLOAT, false, this.stride, 2 * 4)
        .addAttribute(vb, this.attributes.aSize, gl.FLOAT, false, this.stride, 4 * 4)
        .addAttribute(vb, this.attributes.aAnim, gl.FLOAT, false, this.stride, 5 * 4)
        .addAttribute(vb, this.attributes.aTextureId, gl.FLOAT, false, this.stride, 7 * 4);
};

module.exports = SquareTileShader;
