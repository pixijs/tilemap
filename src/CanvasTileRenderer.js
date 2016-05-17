function CanvasTileRenderer(renderer) {
    this.renderer = renderer;
    this.tileAnim = [0, 0];
}

PIXI.CanvasRenderer.registerPlugin('tile', CanvasTileRenderer);

module.exports = CanvasTileRenderer;
