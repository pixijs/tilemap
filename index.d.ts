import type { AbstractRenderer } from '@pixi/core';
import { BaseTexture } from '@pixi/core';
import { Bounds } from '@pixi/display';
import { Buffer as Buffer_2 } from '@pixi/core';
import type { CanvasRenderer } from '@pixi/canvas-renderer';
import * as constants from '@pixi/constants';
import { Container } from '@pixi/display';
import { Geometry } from '@pixi/core';
import { GLTexture } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import { Matrix } from '@pixi/math';
import { ObjectRenderer } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { Renderer } from '@pixi/core';
import { Resource } from '@pixi/core';
import { SCALE_MODES } from '@pixi/constants';
import { Shader } from '@pixi/core';
import { Texture } from '@pixi/core';

export declare class CanvasTileRenderer {
    renderer: AbstractRenderer;
    tileAnim: number[];
    dontUseTransform: boolean;
    constructor(renderer: AbstractRenderer);
}

declare class CompositeTilemap extends Container {
    readonly texturesPerTilemap: number;
    tileAnim: Array<number>;
    protected lastModifiedTilemap: Tilemap;
    private modificationMarker;
    private shadowColor;
    private _globalMat;
    constructor(tileset?: Array<Texture>, texturesPerTilemap?: number);
    constructor(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number);
    tileset(tileTextures: Array<Texture>): this;
    clear(): this;
    tileRotate(rotate: number): this;
    tileAnimX(offset: number, count: number): this;
    tileAnimY(offset: number, count: number): this;
    tile(texture_: Texture | string | number, x: number, y: number, options?: {
        u?: number;
        v?: number;
        tileWidth?: number;
        tileHeight?: number;
        animX?: number;
        animY?: number;
        rotate?: number;
        animCountX?: number;
        animCountY?: number;
    }): this;
    renderCanvas(renderer: CanvasRenderer): void;
    render(renderer: Renderer): void;
    isModified(anim: boolean): boolean;
    clearModify(): void;
    addFrame(texture: Texture | string | number, x: number, y: number, animX?: number, animY?: number, animWidth?: number, animHeight?: number): this;
    addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX?: number, animY?: number, rotate?: number, animWidth?: number, animHeight?: number): this;
    initialize(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number): void;
    setBitmaps: (tileTextures: Array<Texture>) => this;
    get texPerChild(): number;
}
export { CompositeTilemap as CompositeRectTileLayer }
export { CompositeTilemap }

export declare const Constant: {
    TEXTURES_PER_TILEMAP: number;
    TEXTILE_DIMEN: number;
    TEXTILE_UNITS: number;
    TEXTILE_SCALE_MODE: SCALE_MODES;
    use32bitIndex: boolean;
    DO_CLEAR: boolean;
    maxTextures: number;
    boundSize: number;
    boundCountPerBuffer: number;
};

export declare function fillSamplers(shader: TilemapShader, maxTextures: number): void;

export declare function generateFragmentSrc(maxTextures: number, fragmentSrc: string): string;

export declare const pixi_tilemap: {
    CanvasTileRenderer: typeof CanvasTileRenderer;
    CompositeRectTileLayer: typeof CompositeTilemap;
    CompositeTilemap: typeof CompositeTilemap;
    Constant: {
        TEXTURES_PER_TILEMAP: number;
        TEXTILE_DIMEN: number;
        TEXTILE_UNITS: number;
        TEXTILE_SCALE_MODE: constants.SCALE_MODES;
        use32bitIndex: boolean;
        DO_CLEAR: boolean;
        maxTextures: number;
        boundSize: number;
        boundCountPerBuffer: number;
    };
    TextileResource: typeof TextileResource;
    MultiTextureResource: typeof TextileResource;
    RectTileLayer: typeof Tilemap;
    Tilemap: typeof Tilemap;
    TilemapShader: typeof TilemapShader;
    TilemapGeometry: typeof TilemapGeometry;
    RectTileShader: typeof TilemapShader;
    RectTileGeom: typeof TilemapGeometry;
    TileRenderer: typeof TileRenderer;
};

export declare const POINT_STRUCT_SIZE = 12;

export declare const settings: {
    TEXTURES_PER_TILEMAP: number;
    TEXTILE_DIMEN: number;
    TEXTILE_UNITS: number;
    TEXTILE_SCALE_MODE: SCALE_MODES;
    use32bitIndex: boolean;
    DO_CLEAR: boolean;
    maxTextures: number;
    boundSize: number;
    boundCountPerBuffer: number;
};

export declare interface TextileOptions {
    TEXTILE_DIMEN: number;
    TEXTILE_UNITS: number;
    DO_CLEAR?: boolean;
}

export declare class TextileResource extends Resource {
    baseTexture: BaseTexture;
    private readonly doClear;
    private readonly tileDimen;
    private readonly tiles;
    private _clearBuffer;
    constructor(options?: TextileOptions);
    tile(index: number, texture: Texture): void;
    bind(baseTexture: BaseTexture): void;
    upload(renderer: Renderer, texture: BaseTexture, glTexture: GLTexture): boolean;
}

declare class Tilemap extends Container {
    modificationMarker: number;
    shadowColor: Float32Array;
    _globalMat: Matrix;
    offsetX: number;
    offsetY: number;
    compositeParent: boolean;
    tileAnim: Array<number>;
    protected tileset: Array<Texture>;
    protected readonly tilemapBounds: Bounds;
    protected hasAnimatedTile: boolean;
    private pointsBuf;
    constructor(tileset: Texture | Array<Texture>);
    constructor(zIndex: number, textures: Texture | Array<Texture>);
    getTileset(): Array<Texture>;
    setTileset(tileset?: Texture | Array<Texture>): this;
    clear(): this;
    tile(tileTexture: number | string | Texture, x: number, y: number, options: {
        u?: number;
        v?: number;
        tileWidth?: number;
        tileHeight?: number;
        animX?: number;
        animY?: number;
        rotate?: number;
        animCountX?: number;
        animCountY?: number;
    }): this;
    tileRotate(rotate: number): void;
    tileAnimX(offset: number, count: number): void;
    tileAnimY(offset: number, count: number): void;
    renderCanvas(renderer: CanvasRenderer): void;
    renderCanvasCore(renderer: CanvasRenderer): void;
    private vbId;
    private vb;
    private vbBuffer;
    private vbArray;
    private vbInts;
    private destroyVb;
    render(renderer: Renderer): void;
    renderWebGLCore(renderer: Renderer, plugin: TileRenderer): void;
    isModified(anim: boolean): boolean;
    clearModify(): void;
    protected _calculateBounds(): void;
    getLocalBounds(rect?: Rectangle): Rectangle;
    destroy(options?: IDestroyOptions): void;
    initialize(zIndex: number, textures: Texture | Array<Texture>): void;
    addFrame(texture: Texture | string | number, x: number, y: number, animX: number, animY: number): boolean;
    addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX?: number, animY?: number, rotate?: number, animCountX?: number, animCountY?: number): this;
}
export { Tilemap as RectTileLayer }
export { Tilemap }

export declare class TilemapGeometry extends Geometry {
    vertSize: number;
    vertPerQuad: number;
    stride: number;
    lastTimeAccess: number;
    constructor();
    buf: Buffer_2;
}

export declare class TilemapShader extends Shader {
    maxTextures: number;
    constructor(maxTextures: number);
}

export declare class TileRenderer extends ObjectRenderer {
    readonly renderer: Renderer;
    tileAnim: number[];
    private ibLen;
    private indexBuffer;
    private shader;
    private textiles;
    constructor(renderer: Renderer);
    bindTileTextures(renderer: Renderer, textures: Array<Texture>): void;
    start(): void;
    createVb(): TilemapGeometry;
    getShader(): TilemapShader;
    destroy(): void;
    checkIndexBuffer(size: number, _vb?: TilemapGeometry): void;
    private makeTextiles;
}

export { }
