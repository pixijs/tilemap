import { extensions, ExtensionType, IRenderer } from '@pixi/core';

/**
 * The renderer plugin for canvas. It isn't registered by default.
 *
 * ```
 * import { CanvasTileRenderer } from '@pixi/tilemap';
 * import { CanvasRenderer } from '@pixi/canvas-core';
 *
 * // You must register this yourself (optional). @pixi/tilemap doesn't do it to
 * // prevent a hard dependency on @pixi/canvas-core.
 * CanvasTileRenderer.registerExtension();
 * ```
 */
// TODO: Move to @pixi/tilemap-canvas
export class CanvasTileRenderer {
    /** The renderer */
    renderer: IRenderer;

    /** The global tile animation state */
    tileAnim = [0, 0];

    /** @deprecated */
    dontUseTransform = false;

    /** @param renderer */
    constructor(renderer: IRenderer) {
        this.renderer = renderer;
        this.tileAnim = [0, 0];
    }

    static registerExtension() {
        extensions.add({
            name: 'tilemap',
            type: ExtensionType.CanvasRendererPlugin,
            ref: CanvasTileRenderer as any
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static getInstance(renderer: any): CanvasTileRenderer {
        if (!renderer.plugins.tilemap) {
            throw new Error('Extension not registered!');
        }

        return renderer.plugins.tilemap;
    }
}
