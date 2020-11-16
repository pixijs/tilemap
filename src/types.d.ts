/*
 * Temporary hack until pixi.js releases typings at a per-package basis.
 */

declare module '@pixi/constants' {
  export { ALPHA_MODES, DRAW_MODES, WRAP_MODES, SCALE_MODES } from 'pixi.js';
}

declare module '@pixi/core' {
  export {
    BaseTexture,
    Buffer,
    Texture,
    ObjectRenderer,
    Renderer,
    GLTexture,
    Geometry,
    Shader,
    Program,
    resources,
  } from 'pixi.js';
}

declare module '@pixi/display' {
  export { DisplayObject, Container, Bounds } from 'pixi.js';
}

declare module '@pixi/math' {
  export { Matrix, groupD8, Rectangle } from 'pixi.js';
}

declare module '@pixi/graphics' {
  export { Graphics } from 'pixi.js';
}

declare module '@pixi/sprite' {
  export { Sprite } from 'pixi.js';
}

declare module '@pixi/canvas-renderer' {
  export const CanvasRenderer: any;
}

declare module '@pixi/utils' {
  export function createIndicesForQuads(
    size: number,
    outBuffer: Uint16Array | Uint32Array | null
  ): Uint16Array | Uint32Array;
}
