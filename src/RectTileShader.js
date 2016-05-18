var glslify  = require('glslify'), shaderGenerator = require('./shaderGenerator');

function RectTileShader(gl, maxTextures)
{
    PIXI.Shader.call(this, gl,
        glslify('./rect.vert', 'utf8'),
        shaderGenerator.generateFragmentSrc(maxTextures, glslify('./rect.frag', 'utf8'))
    );
    this.maxTextures = maxTextures;
    this.vertSize = 7;
    this.vertPerQuad = 6;
    this.stride = this.vertSize * 4;
    shaderGenerator.fillSamplers(this, this.maxTextures);
}

RectTileShader.prototype = Object.create(PIXI.Shader.prototype);
RectTileShader.prototype.constructor = RectTileShader;
RectTileShader.prototype.createVao = function (renderer, vb) {
    var gl = renderer.gl;
    return renderer.createVao()
        .addIndex(this.indexBuffer)
        .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
        .addAttribute(vb, this.attributes.aTextureCoord, gl.FLOAT, false, this.stride, 2 * 4)
        .addAttribute(vb, this.attributes.aAnim, gl.FLOAT, false, this.stride, 4 * 4)
        .addAttribute(vb, this.attributes.aTextureId, gl.FLOAT, false, this.stride, 6 * 4);
};

module.exports = RectTileShader;
