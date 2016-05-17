var glslify  = require('glslify');

function RectTileShader(gl)
{
    PIXI.Shader.call(this, gl,
        glslify('./rect.vert', 'utf8'),
        glslify('./rect.frag', 'utf8')
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
