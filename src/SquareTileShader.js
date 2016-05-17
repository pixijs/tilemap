var glslify  = require('glslify');

function SquareTileShader(gl) {
    PIXI.Shader.call(this, gl,
        glslify('./square.vert', 'utf8'),
        glslify('./square.frag', 'utf8')
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
