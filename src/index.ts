import { CanvasTileRenderer } from './CanvasTileRenderer';
import { CompositeTilemap } from './CompositeTilemap';
import { Constant } from './const';
import { MultiTextureResource } from './MultiTextureResource';
import { Tilemap } from './Tilemap';
import { TilemapShader, RectTileShader, RectTileGeom } from './RectTileShader';
import { TileRenderer } from './TileRenderer';

// Prevent SCALE_MODES from becoming lazy import in Constant.ts - which causes a import() in the declaration file,
// which causes API extractor to fail https://github.com/microsoft/rushstack/issues/2140
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as constants from '@pixi/constants';

// eslint-disable-next-line camelcase
export const pixi_tilemap = {
    CanvasTileRenderer,
    CompositeRectTileLayer: CompositeTilemap,
    CompositeTilemap,
    Constant,
    MultiTextureResource,
    RectTileLayer: Tilemap,
    Tilemap,
    TilemapShader,
    RectTileShader,
    RectTileGeom,
    TileRenderer,
};

export * from './CanvasTileRenderer';
export * from './CompositeTilemap';
export * from './const';
export * from './MultiTextureResource';
export * from './Tilemap';
export * from './RectTileShader';
export * from './shaderGenerator';
export * from './TileRenderer';

export { CompositeTilemap as CompositeRectTileLayer } from './CompositeTilemap';
export { Tilemap as RectTileLayer } from './Tilemap';
