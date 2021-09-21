import type { AbstractRenderer } from '@pixi/core';

/**
 * The renderer plugin for canvas. It isn't registered by default.
 *
 * ```
 * import { CanvasTileRenderer } from '@pixi/tilemap';
 * import { CanvasRenderer } from '@pixi/canvas-core';
 *
 * // You must register this yourself (optional). @pixi/tilemap doesn't do it to
 * // prevent a hard dependency on @pixi/canvas-core.
 * CanvasRenderer.registerPlugin('tilemap', CanvasTileRenderer);
 * ```
 */
// TODO: Move to @pixi/tilemap-canvas
export class CanvasTileRenderer
{
    /** The renderer */
    renderer: AbstractRenderer;

    /** The global tile animation state */
    tileAnim = [0, 0];

    /** @deprecated */
    dontUseTransform = false;

    /** @param renderer */
    constructor(renderer: AbstractRenderer)
    {
        this.renderer = renderer;
        this.tileAnim = [0, 0];
    }

    static getInstance(renderer: any) {
        if (!renderer.plugins.tilemap) {
            renderer.plugins.tilemap = new CanvasTileRenderer(renderer);
        }
        return renderer.plugins.tilemap;
    }
}
