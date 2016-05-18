var RectTileShader = require('./RectTileShader'),
    SquareTileShader = require('./SquareTileShader'),
    glCore = PIXI.glCore;

/**
 * The default vertex shader source
 *
 * @static
 * @constant
 */
function TileRenderer(renderer) {
    PIXI.ObjectRenderer.call(this, renderer);
    this.vbs = {};
    this.lastTimeCheck = 0;
    this.tileAnim = [0, 0];
    this.maxTextures = 4;
    this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
}

TileRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
TileRenderer.prototype.constructor = TileRenderer;
TileRenderer.vbAutoincrement = 0;

TileRenderer.prototype.onContextChange = function() {
    var gl = this.renderer.gl;
    var maxTextures = this.maxTextures;
    this.rectShader = new RectTileShader(gl, maxTextures);
    this.squareShader = new SquareTileShader(gl, maxTextures);
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);
    this.rectShader.indexBuffer = this.indexBuffer;
    this.squareShader.indexBuffer = this.indexBuffer;
    this.vbs = {};
    this.glTextures = [];
    this.boundSprites = [];
    this.initBounds();
};

TileRenderer.prototype.initBounds = function() {
    var gl = this.renderer.gl;
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = 2048;
    tempCanvas.height = 2048;
    // tempCanvas.getContext('2d').clearRect(0, 0, 2048, 2048);
    for (var i=0;i<this.maxTextures; i++) {
        var glt = new glCore.GLTexture(gl, 2048, 2048);
        glt.premultiplyAlpha = true;
        glt.upload(tempCanvas);
        glt.enableWrapClamp();
        glt.enableLinearScaling();
        this.glTextures.push(glt);
        var bs = [];
        for (var j=0;j<4;j++) {
            var spr = new PIXI.Sprite();
            spr.position.x = 1024 * (j & 1);
            spr.position.y = 1024 * (j >> 1);
            bs.push(spr);
        }
        this.boundSprites.push(bs);
    }
};

glCore.GLTexture.prototype._hackSubImage = function(sprite) {
    this.bind();
    var gl = this.gl;
    var baseTex = sprite.texture.baseTexture;
    gl.texSubImage2D(gl.TEXTURE_2D, 0, sprite.position.x, sprite.position.y, this.format, this.type, baseTex.source);
};

TileRenderer.prototype.bindTextures = function(renderer, textures) {
    var bounds = this.boundSprites;
    var glts = this.glTextures;
    var len = textures.length;
    var maxTextures = this.maxTextures;
    if (len >= 4 * maxTextures) {
        return;
    }
    var i;
    for (i=0;i<len;i++) {
        var texture = textures[i];
        if (!texture || !textures[i].valid) continue;
        var bs = bounds[i >> 2][i & 3];
        if (bs.texture !== texture) {
            bs.texture = texture;
            var glt = glts[ i >> 2 ];
            glt._hackSubImage(bs);
        }
    }
    for (i = 0; i < maxTextures; i++) {
        glts[i].bind(i);
    }
    renderer._activeTextureLocation = maxTextures - 1;
};

TileRenderer.prototype.checkLeaks = function() {
    var now = Date.now();
    var old = now - 10000;
    if (this.lastTimeCheck < old ||
        this.lastTimeCheck > now) {
        this.lastTimeCheck = now;
        var vbs = this.vbs;
        for (var key in vbs) {
            if (vbs[key].lastTimeAccess < old) {
                this.removeVb(key);
            }
        }
    }
};

TileRenderer.prototype.start = function() {
    this.renderer.state.setBlendMode( PIXI.BLEND_MODES.NORMAL );
    //sorry, nothing
};

TileRenderer.prototype.getVb = function(id) {
    this.checkLeaks();
    var vb = this.vbs[id];
    if (vb) {
        vb.lastAccessTime = Date.now();
        return vb;
    }
    return null;
};

TileRenderer.prototype.createVb = function(useSquare) {
    var id = ++TileRenderer.vbAutoincrement;
    var shader = this.getShader(useSquare);
    var gl = this.renderer.gl;
    var vb = PIXI.glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
    var stuff = {
        id: id,
        vb: vb,
        vao: shader.createVao(this.renderer, vb),
        lastTimeAccess: Date.now(),
        useSquare: useSquare,
        shader: shader
    };
    this.vbs[id] = stuff;
    return stuff;
};

TileRenderer.prototype.removeVb = function(id) {
    if (this.vbs[id]) {
        this.vbs[id].vb.destroy();
        this.vbs[id].vao.destroy();
        delete this.vbs[id];
    }
};

TileRenderer.prototype.getShader = function(useSquare) {
    return useSquare ? this.squareShader : this.rectShader;
};

TileRenderer.prototype.destroy = function () {
    PIXI.ObjectRenderer.prototype.destroy.call(this);
    this.rectShader.destroy();
    this.squareShader.destroy();
    this.rectShader = null;
    this.squareShader = null;
};

PIXI.WebGLRenderer.registerPlugin('tile', TileRenderer);

module.exports = TileRenderer;
