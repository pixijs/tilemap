// Prevent SCALE_MODES from becoming lazy import in Constant.ts - which causes a import() in the declaration file,
// which causes API extractor to fail https://github.com/microsoft/rushstack/issues/2140
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import { extensions } from 'pixi.js';
import { GlTilemapAdaptor } from './gl_tilemap';
import { GpuTilemapAdaptor } from './gpu_tilemap';
import { TilemapPipe } from './TilemapPipe';

export * from './CompositeTilemap';
export * from './settings';
export * from './Tilemap';
export * from './TilemapGeometry';
export * from './TilemapPipe';

extensions.add(TilemapPipe);
extensions.add(GlTilemapAdaptor);
extensions.add(GpuTilemapAdaptor);
