import { Renderer } from '@pixi/core';

export class CanvasTileRenderer {
    renderer: Renderer;
    tileAnim = [0, 0];
    dontUseTransform = false;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.tileAnim = [0, 0];
    }
}

const cr = (globalThis as any).PIXI && (globalThis as any).PIXI.CanvasRenderer;

if (cr) {
    cr.registerPlugin('tilemap', CanvasTileRenderer);
}
