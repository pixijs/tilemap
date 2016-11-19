/// <reference types="pixi.js" />
declare module PIXI.tilemap {
    class CanvasTileRenderer {
        renderer: PIXI.CanvasRenderer;
        tileAnim: number[];
        dontUseTransform: boolean;
        constructor(renderer: PIXI.CanvasRenderer);
    }
}
declare module PIXI.tilemap {
    class CompositeRectTileLayer extends PIXI.Container {
        constructor(zIndex?: number, bitmaps?: Array<Texture>, useSquare?: boolean, texPerChild?: number);
        updateTransform(): void;
        z: number;
        zIndex: number;
        useSquare: boolean;
        shadowColor: Float32Array;
        texPerChild: number;
        modificationMarker: number;
        _globalMat: PIXI.Matrix;
        _tempScale: Array<number>;
        initialize(zIndex?: number, bitmaps?: Array<Texture>, useSquare?: boolean, texPerChild?: number): void;
        setBitmaps(bitmaps: Array<Texture>): void;
        clear(): void;
        addRect(num: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number): void;
        addFrame(texture_: PIXI.Texture | String, x: number, y: number): boolean;
        renderCanvas(renderer: CanvasRenderer): void;
        renderWebGL(renderer: WebGLRenderer): void;
        isModified(anim: boolean): boolean;
        clearModify(): void;
    }
}
declare module PIXI.tilemap {
}
declare module PIXI.tilemap {
    class RectTileLayer extends PIXI.Container {
        constructor(zIndex: number, texture: PIXI.Texture | Array<PIXI.Texture>);
        textures: Array<Texture>;
        z: number;
        zIndex: number;
        pointsBuf: Array<number>;
        _tempSize: Float32Array;
        _tempTexSize: number;
        modificationMarker: number;
        hasAnim: boolean;
        initialize(zIndex: number, textures: PIXI.Texture | Array<PIXI.Texture>): void;
        clear(): void;
        renderCanvas(renderer: CanvasRenderer): void;
        addRect(textureId: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX?: number, animY?: number): void;
        vbId: number;
        vbBuffer: ArrayBuffer;
        vbArray: Float32Array;
        vbInts: Uint32Array;
        renderWebGL(renderer: WebGLRenderer, useSquare?: boolean): void;
    }
}
declare module PIXI.tilemap {
    import GLBuffer = PIXI.glCore.GLBuffer;
    import VertexArrayObject = PIXI.glCore.VertexArrayObject;
    abstract class TilemapShader extends PIXI.Shader {
        maxTextures: number;
        indexBuffer: GLBuffer;
        constructor(gl: WebGLRenderingContext, maxTextures: number, shaderVert: string, shaderFrag: string);
        abstract createVao(renderer: WebGLRenderer, vb: GLBuffer): VertexArrayObject;
    }
    class RectTileShader extends TilemapShader {
        vertSize: number;
        vertPerQuad: number;
        stride: number;
        constructor(gl: WebGLRenderingContext, maxTextures: number);
        createVao(renderer: WebGLRenderer, vb: GLBuffer): VertexArrayObject;
    }
}
declare module PIXI.tilemap.shaderGenerator {
    function fillSamplers(shader: TilemapShader, maxTextures: number): void;
    function generateFragmentSrc(maxTextures: number, fragmentSrc: string): string;
    function generateSampleSrc(maxTextures: number): string;
}
declare module PIXI.tilemap {
    import GLBuffer = PIXI.glCore.GLBuffer;
    import VertexArrayObject = PIXI.glCore.VertexArrayObject;
    class SquareTileShader extends TilemapShader {
        vertSize: number;
        vertPerQuad: number;
        stride: number;
        constructor(gl: WebGLRenderingContext, maxTextures: number);
        indexBuffer: GLBuffer;
        createVao(renderer: WebGLRenderer, vb: GLBuffer): VertexArrayObject;
    }
}
declare module PIXI.tilemap {
    import glCore = PIXI.glCore;
    class TileRenderer extends PIXI.ObjectRenderer {
        static vbAutoincrement: number;
        static SCALE_MODE: number;
        renderer: WebGLRenderer;
        gl: WebGLRenderingContext;
        vbs: {
            [key: string]: any;
        };
        indices: Uint16Array;
        indexBuffer: glCore.GLBuffer;
        lastTimeCheck: number;
        tileAnim: number[];
        maxTextures: number;
        texLoc: Array<number>;
        rectShader: RectTileShader;
        squareShader: SquareTileShader;
        boundSprites: Array<Array<PIXI.Sprite>>;
        glTextures: Array<PIXI.RenderTexture>;
        constructor(renderer: WebGLRenderer);
        onContextChange(): void;
        initBounds(): void;
        bindTextures(renderer: WebGLRenderer, shader: TilemapShader, textures: Array<PIXI.Texture>): void;
        checkLeaks(): void;
        start(): void;
        getVb(id: string): any;
        createVb(useSquare: boolean): {
            id: number;
            vb: glCore.GLBuffer;
            vao: glCore.VertexArrayObject;
            lastTimeAccess: number;
            useSquare: boolean;
            shader: TilemapShader;
        };
        removeVb(id: string): void;
        checkIndexBuffer(size: number): void;
        getShader(useSquare: boolean): TilemapShader;
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
        _tempRender: PIXI.CanvasRenderer;
        _lastAnimationFrame: number;
        layerTransform: PIXI.Matrix;
        clear(): void;
        cacheIfDirty(): void;
        renderCanvas(renderer: PIXI.CanvasRenderer): void;
    }
}
