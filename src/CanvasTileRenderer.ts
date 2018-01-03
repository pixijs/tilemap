namespace pixi_tilemap {

    export class CanvasTileRenderer {

        renderer: PIXI.CanvasRenderer;
        tileAnim = [0, 0];
        dontUseTransform = false;

        constructor(renderer: PIXI.CanvasRenderer) {
            this.renderer = renderer;
            this.tileAnim = [0, 0];
        }
    }

    PIXI.CanvasRenderer.registerPlugin('tilemap', CanvasTileRenderer);

}
