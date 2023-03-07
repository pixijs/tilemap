import { CanvasTileRenderer } from './CanvasTileRenderer';
import { CompositeTilemap } from './CompositeTilemap';
import { Constant } from './settings';
import { TextileResource } from './TextileResource';
import { Tilemap } from './Tilemap';
import { TilemapShader, TilemapGeometry } from './TilemapShader';
import { TileRenderer } from './TileRenderer';

// Prevent SCALE_MODES from becoming lazy import in Constant.ts - which causes a import() in the declaration file,
// which causes API extractor to fail https://github.com/microsoft/rushstack/issues/2140
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { extensions, ExtensionType, SCALE_MODES } from '@pixi/core';

// eslint-disable-next-line camelcase
export const pixi_tilemap = {
    CanvasTileRenderer,
    CompositeRectTileLayer: CompositeTilemap,
    CompositeTilemap,
    Constant,
    TextileResource,
    MultiTextureResource: TextileResource,
    RectTileLayer: Tilemap,
    Tilemap,
    TilemapShader,
    TilemapGeometry,
    RectTileShader: TilemapShader,
    RectTileGeom: TilemapGeometry,
    TileRenderer,
};

export * from './CanvasTileRenderer';
export * from './CompositeTilemap';
export * from './settings';
export * from './TextileResource';
export * from './Tilemap';
export * from './TilemapShader';
export * from './shaderGenerator';
export * from './TileRenderer';

export { CompositeTilemap as CompositeRectTileLayer } from './CompositeTilemap';
export { Tilemap as RectTileLayer } from './Tilemap';

extensions.add({
    name: 'tilemap',
    type: ExtensionType.RendererPlugin,
    ref: TileRenderer as any
});
