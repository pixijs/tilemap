function GraphicsLayer(zIndex) {
    PIXI.Graphics.apply(this, arguments);
    this.z = this.zIndex = zIndex;
}

GraphicsLayer.prototype = Object.create(PIXI.Graphics.prototype);
GraphicsLayer.prototype.constructor = GraphicsLayer;
GraphicsLayer.prototype.renderCanvas = function (renderer) {
    var wt = null;
    if (renderer.dontUseTransform) {
        wt = this.transform.worldTransform;
        this.transform.worldTransform = PIXI.Matrix.IDENTITY;
    }
    renderer.plugins.graphics.render(this);
    if (renderer.dontUseTransform) {
        this.transform.worldTransform = wt;
    }
    renderer.context.globalAlpha = 1.0;
};
GraphicsLayer.prototype.renderWebGL = function(renderer) {
    if (!this._webGL[renderer.gl.id])
        this.dirty = true;
    PIXI.Graphics.prototype.renderWebGL.call(this, renderer);
};

GraphicsLayer.prototype.isModified = function(anim) {
    return false;
};

GraphicsLayer.prototype.clearModify = function() {
};

module.exports = GraphicsLayer;
