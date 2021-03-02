import type { AbstractRenderer } from '@pixi/core';

// TODO: Move to @pixi/tilemap-canvas
export class CanvasTileRenderer
{
    renderer: AbstractRenderer;
    tileAnim = [0, 0];
    dontUseTransform = false;

    constructor(renderer: AbstractRenderer)
    {
        this.renderer = renderer;
        this.tileAnim = [0, 0];
    }
}