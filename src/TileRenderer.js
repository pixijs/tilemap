var RectTileShader = require('./RectTileShader'),
    SquareTileShader = require('./SquareTileShader');

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
    this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
}

TileRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
TileRenderer.prototype.constructor = TileRenderer;
TileRenderer.vbAutoincrement = 0;

TileRenderer.prototype.onContextChange = function() {
    var gl = this.renderer.gl;
    this.rectShader = new RectTileShader(gl);
    this.squareShader = new SquareTileShader(gl);
    this.indexBuffer = PIXI.glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);
    this.rectShader.indexBuffer = this.indexBuffer;
    this.squareShader.indexBuffer = this.indexBuffer;
    this.vbs = {};
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
