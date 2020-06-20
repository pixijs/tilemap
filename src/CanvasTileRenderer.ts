namespace pixi_tilemap {

    export class CanvasTileRenderer {
        renderer: any;
        tileAnim = [0, 0];
        startTime = Date.now();
        dontUseTransform = false;

        constructor(renderer: any) {
            this.renderer = renderer;
            this.tileAnim = [0, 0];
        }
    }

    const cr = (PIXI as any).CanvasRenderer;
    if (cr) {
        cr.registerPlugin('tilemap', CanvasTileRenderer);
    }
}
