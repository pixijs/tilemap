declare module PIXI.tilemap {
    class CanvasTileRenderer {
        renderer: any;
        tileAnim: number[];
        dontUseTransform: boolean;
        constructor(renderer: any);
    }
}
declare module PIXI.tilemap {
    class CompositeRectTileLayer extends PIXI.Container {
        constructor(zIndex?: number, bitmaps?: Array<PIXI.Texture>, texPerChild?: number);
        updateTransform(): void;
        z: number;
        zIndex: number;
        modificationMarker: number;
        shadowColor: Float32Array;
        _globalMat: PIXI.Matrix;
        texPerChild: number;
        initialize(zIndex?: number, bitmaps?: Array<PIXI.Texture>, texPerChild?: number): void;
        setBitmaps(bitmaps: Array<PIXI.Texture>): void;
        clear(): void;
        addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number): void;
        addFrame(texture_: PIXI.Texture | String | number, x: number, y: number, animX?: number, animY?: number): boolean;
        renderCanvas(renderer: any): void;
        render(renderer: PIXI.Renderer): void;
        isModified(anim: boolean): boolean;
        clearModify(): void;
    }
}
declare module PIXI.tilemap {
    const Constant: {
        maxTextures: number;
        bufferSize: number;
        boundSize: number;
        boundCountPerBuffer: number;
        use32bitIndex: boolean;
        SCALE_MODE: PIXI.SCALE_MODES;
        DO_CLEAR: boolean;
    };
}
declare module PIXI.tilemap {
}
declare module PIXI.tilemap {
}
declare module PIXI.tilemap {
    interface IMultiTextureOptions {
        boundCountPerBuffer: number;
        boundSize: number;
        bufferSize: number;
        DO_CLEAR?: boolean;
    }
    class MultiTextureResource extends PIXI.resources.Resource {
        constructor(options: IMultiTextureOptions);
        DO_CLEAR: boolean;
        boundSize: number;
        _clearBuffer: Uint8Array;
        bind(baseTexture: PIXI.BaseTexture): void;
        baseTex: PIXI.BaseTexture;
        boundSprites: Array<PIXI.Sprite>;
        dirties: Array<number>;
        setTexture(ind: number, texture: PIXI.Texture): void;
        upload(renderer: PIXI.Renderer, texture: PIXI.BaseTexture, glTexture: PIXI.GLTexture): boolean;
    }
}
declare module PIXI.tilemap {
    class RectTileLayer extends PIXI.Container {
        constructor(zIndex: number, texture: PIXI.Texture | Array<PIXI.Texture>);
        zIndex: number;
        modificationMarker: number;
        shadowColor: Float32Array;
        _globalMat: PIXI.Matrix;
        pointsBuf: Array<number>;
        hasAnim: boolean;
        textures: Array<PIXI.Texture>;
        offsetX: number;
        offsetY: number;
        compositeParent: boolean;
        initialize(zIndex: number, textures: PIXI.Texture | Array<PIXI.Texture>): void;
        clear(): void;
        addFrame(texture_: PIXI.Texture | String | number, x: number, y: number, animX: number, animY: number): boolean;
        addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX?: number, animY?: number): void;
        renderCanvas(renderer: any): void;
        renderCanvasCore(renderer: any): void;
        vbId: number;
        vb: RectTileGeom;
        vbBuffer: ArrayBuffer;
        vbArray: Float32Array;
        vbInts: Uint32Array;
        destroyVb(): void;
        render(renderer: PIXI.Renderer): void;
        renderWebGLCore(renderer: PIXI.Renderer, plugin: TileRenderer): void;
        isModified(anim: boolean): boolean;
        clearModify(): void;
        destroy(options?: any): void;
    }
}
declare module PIXI.tilemap {
    abstract class TilemapShader extends PIXI.Shader {
        maxTextures: number;
        constructor(maxTextures: number, shaderVert: string, shaderFrag: string);
    }
    class RectTileShader extends TilemapShader {
        constructor(maxTextures: number);
    }
    class RectTileGeom extends PIXI.Geometry {
        vertSize: number;
        vertPerQuad: number;
        stride: number;
        lastTimeAccess: number;
        constructor();
        buf: PIXI.Buffer;
    }
}
declare module PIXI.tilemap.shaderGenerator {
    function fillSamplers(shader: TilemapShader, maxTextures: number): void;
    function generateFragmentSrc(maxTextures: number, fragmentSrc: string): string;
    function generateSampleSrc(maxTextures: number): string;
}
declare module PIXI.tilemap {
    class TileRenderer extends PIXI.ObjectRenderer {
        renderer: PIXI.Renderer;
        gl: WebGLRenderingContext;
        sn: number;
        indexBuffer: PIXI.Buffer;
        ibLen: number;
        tileAnim: number[];
        texLoc: Array<number>;
        rectShader: RectTileShader;
        texResources: Array<MultiTextureResource>;
        constructor(renderer: PIXI.Renderer);
        initBounds(): void;
        bindTexturesWithoutRT(renderer: PIXI.Renderer, shader: TilemapShader, textures: Array<PIXI.Texture>): void;
        bindTextures(renderer: PIXI.Renderer, shader: TilemapShader, textures: Array<PIXI.Texture>): void;
        start(): void;
        createVb(): RectTileGeom;
        checkIndexBuffer(size: number, vb?: RectTileGeom): void;
        getShader(): TilemapShader;
        destroy(): void;
    }
}
declare module PIXI.tilemap {
    class ZLayer extends PIXI.Container {
        constructor(tilemap: PIXI.Container, zIndex: number);
        tilemap: any;
        z: number;
        zIndex: number;
        _previousLayers: number;
        canvasBuffer: HTMLCanvasElement;
        _tempRender: any;
        _lastAnimationFrame: number;
        layerTransform: PIXI.Matrix;
        clear(): void;
        cacheIfDirty(): void;
        renderCanvas(renderer: any): void;
    }
}
