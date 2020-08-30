/// <reference types="pixi.js" />
import { BaseTexture } from '@pixi/core';
import { Bounds } from '@pixi/display';
import { Buffer as Buffer_2 } from '@pixi/core';
import { Container } from '@pixi/display';
import { Geometry } from '@pixi/core';
import { GLTexture } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
import { Matrix } from '@pixi/math';
import { ObjectRenderer } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { Renderer } from '@pixi/core';
import { resources } from '@pixi/core';
import { SCALE_MODES } from '@pixi/constants';
import { Shader } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';

export declare class CanvasTileRenderer {
    renderer: Renderer;
    tileAnim: number[];
    dontUseTransform: boolean;
    constructor(renderer: Renderer);
}

export declare class CompositeRectTileLayer extends Container {
    constructor(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number);
    z: number;
    zIndex: number;
    modificationMarker: number;
    shadowColor: Float32Array;
    _globalMat: Matrix;
    _lastLayer: RectTileLayer;
    texPerChild: number;
    initialize(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number): void;
    setBitmaps(bitmaps: Array<Texture>): void;
    clear(): void;
    addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX?: number, animY?: number, rotate?: number, animWidth?: number, animHeight?: number): this;
    tileRotate(rotate: number): this;
    tileAnimX(offset: number, count: number): this;
    tileAnimY(offset: number, count: number): this;
    addFrame(texture_: Texture | String | number, x: number, y: number, animX?: number, animY?: number, animWidth?: number, animHeight?: number): this;
    renderCanvas(renderer: any): void;
    render(renderer: Renderer): void;
    isModified(anim: boolean): boolean;
    clearModify(): void;
}

export declare const Constant: {
    maxTextures: number;
    bufferSize: number;
    boundSize: number;
    boundCountPerBuffer: number;
    use32bitIndex: boolean;
    SCALE_MODE: SCALE_MODES;
    DO_CLEAR: boolean;
};

export declare function fillSamplers(shader: TilemapShader, maxTextures: number): void;

export declare function generateFragmentSrc(maxTextures: number, fragmentSrc: string): string;

export declare function generateSampleSrc(maxTextures: number): string;

export declare class GraphicsLayer extends Graphics {
    constructor(zIndex: number);
    renderCanvas(renderer: any): void;
    isModified(anim: boolean): boolean;
    clearModify(): void;
}

export declare interface IMultiTextureOptions {
    boundCountPerBuffer: number;
    boundSize: number;
    bufferSize: number;
    DO_CLEAR?: boolean;
}

export declare class MultiTextureResource extends resources.Resource {
    constructor(options: IMultiTextureOptions);
    DO_CLEAR: boolean;
    boundSize: number;
    _clearBuffer: Uint8Array;
    bind(baseTexture: BaseTexture): void;
    baseTex: BaseTexture;
    boundSprites: Array<Sprite>;
    dirties: Array<number>;
    setTexture(ind: number, texture: Texture): void;
    upload(renderer: Renderer, texture: BaseTexture, glTexture: GLTexture): boolean;
}

export declare const pixi_tilemap: {
    CanvasTileRenderer: typeof CanvasTileRenderer;
    CompositeRectTileLayer: typeof CompositeRectTileLayer;
    Constant: {
        maxTextures: number;
        bufferSize: number;
        boundSize: number;
        boundCountPerBuffer: number;
        use32bitIndex: boolean;
        SCALE_MODE: PIXI.SCALE_MODES;
        DO_CLEAR: boolean;
    };
    GraphicsLayer: typeof GraphicsLayer;
    MultiTextureResource: typeof MultiTextureResource;
    RectTileLayer: typeof RectTileLayer;
    TilemapShader: typeof TilemapShader;
    RectTileShader: typeof RectTileShader;
    RectTileGeom: typeof RectTileGeom;
    TileRenderer: typeof TileRenderer;
    ZLayer: typeof ZLayer;
};

export declare const POINT_STRUCT_SIZE = 12;

export declare class RectTileGeom extends Geometry {
    vertSize: number;
    vertPerQuad: number;
    stride: number;
    lastTimeAccess: number;
    constructor();
    buf: Buffer_2;
}

export declare class RectTileLayer extends Container {
    constructor(zIndex: number, texture: Texture | Array<Texture>);
    zIndex: number;
    modificationMarker: number;
    _$_localBounds: Bounds;
    shadowColor: Float32Array;
    _globalMat: Matrix;
    pointsBuf: Array<number>;
    hasAnim: boolean;
    textures: Array<Texture>;
    offsetX: number;
    offsetY: number;
    compositeParent: boolean;
    initialize(zIndex: number, textures: Texture | Array<Texture>): void;
    clear(): void;
    addFrame(texture_: Texture | String | number, x: number, y: number, animX: number, animY: number): boolean;
    addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX?: number, animY?: number, rotate?: number, animCountX?: number, animCountY?: number): this;
    tileRotate(rotate: number): void;
    tileAnimX(offset: number, count: number): void;
    tileAnimY(offset: number, count: number): void;
    renderCanvas(renderer: any): void;
    renderCanvasCore(renderer: any): void;
    vbId: number;
    vb: RectTileGeom;
    vbBuffer: ArrayBuffer;
    vbArray: Float32Array;
    vbInts: Uint32Array;
    destroyVb(): void;
    render(renderer: Renderer): void;
    renderWebGLCore(renderer: Renderer, plugin: TileRenderer): void;
    isModified(anim: boolean): boolean;
    clearModify(): void;
    protected _calculateBounds(): void;
    getLocalBounds(rect?: Rectangle): Rectangle;
    destroy(options?: any): void;
}

export declare class RectTileShader extends TilemapShader {
    constructor(maxTextures: number);
}

export declare abstract class TilemapShader extends Shader {
    maxTextures: number;
    constructor(maxTextures: number, shaderVert: string, shaderFrag: string);
}

export declare class TileRenderer extends ObjectRenderer {
    renderer: Renderer;
    gl: WebGLRenderingContext;
    sn: number;
    indexBuffer: Buffer_2;
    ibLen: number;
    tileAnim: number[];
    texLoc: Array<number>;
    rectShader: RectTileShader;
    texResources: Array<MultiTextureResource>;
    constructor(renderer: Renderer);
    initBounds(): void;
    bindTexturesWithoutRT(renderer: Renderer, shader: TilemapShader, textures: Array<Texture>): void;
    bindTextures(renderer: Renderer, shader: TilemapShader, textures: Array<Texture>): void;
    start(): void;
    createVb(): RectTileGeom;
    checkIndexBuffer(size: number, vb?: RectTileGeom): void;
    getShader(): TilemapShader;
    destroy(): void;
}

export declare class ZLayer extends Container {
    constructor(tilemap: Container, zIndex: number);
    tilemap: any;
    z: number;
    zIndex: number;
    _previousLayers: number;
    canvasBuffer: HTMLCanvasElement;
    _tempRender: any;
    _lastAnimationFrame: number;
    layerTransform: Matrix;
    clear(): void;
    cacheIfDirty(): void;
    renderCanvas(renderer: any): void;
}

export { }
