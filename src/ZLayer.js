function ZLayer() {
    this.initialize.apply(this, arguments);
}

ZLayer.prototype = Object.create(PIXI.Container.prototype);
ZLayer.prototype.initialize = function(tilemap, zIndex) {
    PIXI.Container.apply(this, arguments);
    this.tilemap = tilemap;
    this.z = zIndex;
};

ZLayer.prototype.clear = function() {
    var layers = this.children;
    for (var i=0; i<layers.length; i++)
        layers[i].clear();
    this._previousLayers = 0;
};

ZLayer.prototype.cacheIfDirty = function() {
    var tilemap = this.tilemap;
    var layers = this.children;
    var modified = this._previousLayers != layers.length;
    this._previousLayers = layers.length;
    var buf = this.canvasBuffer;
    var tempRender = this._tempRender;
    if (!buf) {
        buf = this.canvasBuffer = document.createElement('canvas');
        tempRender = this._tempRender = new PIXI.CanvasRenderer(100, 100, { view: buf });
        tempRender.context = tempRender.rootContext;
        tempRender.dontUseTransform = true;
    }
    if (buf.width != tilemap._layerWidth ||
        buf.height != tilemap._layerHeight) {
        buf.width = tilemap._layerWidth;
        buf.height = tilemap._layerHeight;
        modified = true;
    }
    var i;
    if (!modified) {
        for (i=0;i<layers.length;i++) {
            if (layers[i].isModified(this._lastAnimationFrame != tilemap.animationFrame)) {
                modified = true;
                break;
            }
        }
    }
    this._lastAnimationFrame = tilemap.animationFrame;
    if (modified) {
        if (tilemap._hackRenderer) {
            tilemap._hackRenderer(tempRender);
        }
        tempRender.context.clearRect(0, 0, buf.width, buf.height);
        for (i=0;i<layers.length;i++) {
            layers[i].clearModify();
            layers[i].renderCanvas(tempRender);
        }
    }
    this.layerTransform = this.worldTransform;
    for (i=0;i<layers.length;i++) {
        this.layerTransform = layers[i].worldTransform;
        break;
    }
};

ZLayer.prototype.renderCanvas = function(renderer) {
    this.cacheIfDirty();
    var wt = this.layerTransform;
    renderer.context.setTransform(
        wt.a,
        wt.b,
        wt.c,
        wt.d,
        wt.tx * renderer.resolution,
        wt.ty * renderer.resolution
    );
    var tilemap = this.tilemap;
    renderer.context.drawImage(this.canvasBuffer, 0, 0);
};

module.exports = ZLayer;
