import { Container } from '@pixi/display';
import { Texture, Renderer } from '@pixi/core';
import { Matrix } from '@pixi/math';
import { Constant } from './const';
import { Tilemap } from './Tilemap';

import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { TileRenderer } from './TileRenderer';

/**
 * A tilemap composite that lazily builds tilesets layered into multiple tilemaps.
 *
 * NOTE: It is illegal to modify the children of a composite tilemap. A future release will enforce this.
 */
export class CompositeTilemap extends Container
{
    constructor(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number)
    {
        super();
        this.initialize(zIndex, bitmaps, texPerChild);
    }

    z: number;
    modificationMarker = 0;
    shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
    _globalMat: Matrix = null;
    _lastLayer: Tilemap = null;

    texPerChild: number;
    tileAnim: Array<number> = null;

    setBitmaps(bitmaps: Array<Texture>) {
        for (let i=0;i<bitmaps.length;i++) {
            if (bitmaps[i] && !bitmaps[i].baseTexture) {
                throw new Error(`pixi-tilemap cannot use destroyed textures. `+
                    `Probably, you passed resources['myAtlas'].texture in pixi > 5.2.1, it does not exist there.`);
            }
        }
        let texPerChild = this.texPerChild;
        let len1 = this.children.length;
        let len2 = Math.ceil(bitmaps.length / texPerChild);
        let i: number;
        for (i = 0; i < len1; i++) {
            (this.children[i] as Tilemap).setTileset(
                bitmaps.slice(i * texPerChild, (i + 1) * texPerChild)
            );
        }
        for (i = len1; i < len2; i++) {
            const layer = new Tilemap(this.zIndex, bitmaps.slice(i * texPerChild, (i + 1) * texPerChild));

            layer.compositeParent = true;
            layer.offsetX = Constant.boundSize;
            layer.offsetY = Constant.boundSize;

            this.addChild(layer);
        }
    }

    clear() {
        for (let i = 0; i < this.children.length; i++) {
            (this.children[i] as Tilemap).clear();
        }
        this.modificationMarker = 0;
    }

    addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX?: number, animY?: number, rotate?: number, animWidth?: number, animHeight?: number): this {
        const childIndex: number = textureIndex / this.texPerChild >> 0;
        const textureId: number = textureIndex % this.texPerChild;

        if (this.children[childIndex] && (this.children[childIndex] as Tilemap).getTileset()) {
            this._lastLayer = (this.children[childIndex] as Tilemap);
            this._lastLayer.addRect(textureId, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate, animWidth, animHeight);
        } else {
            this._lastLayer = null;
        }

        return this;
    }

    tileRotate(rotate: number): this {
        if (this._lastLayer)
        {
            this._lastLayer.tileRotate(rotate);
        }
        return this;
    }

    tileAnimX(offset: number, count: number): this {
        if (this._lastLayer)
        {
            this._lastLayer.tileAnimX(offset, count);
        }
        return this;
    }

    tileAnimY(offset: number, count: number): this {
        if (this._lastLayer)
        {
            this._lastLayer.tileAnimY(offset, count);
        }
        return this;
    }

    addFrame(texture_: Texture | string | number, x: number, y: number, animX?: number, animY?: number, animWidth?: number, animHeight?: number): this {
        let texture: Texture;
        let layer: Tilemap = null;
        let ind  = 0;
        let children = this.children;

        this._lastLayer = null;
        if (typeof texture_ === "number") {
            let childIndex = texture_ / this.texPerChild >> 0;
            layer = children[childIndex] as Tilemap;

            if (!layer) {
                layer = children[0] as Tilemap;
                if (!layer) {
                    return this;
                }
                ind = 0;
            } else {
                ind = texture_ % this.texPerChild;
            }

            texture = layer.getTileset()[ind];
        } else {
            if (typeof texture_ === "string") {
                texture = Texture.from(texture_);
            } else {
                texture = texture_ as Texture;
            }

            for (let i = 0; i < children.length; i++) {
                let child = children[i] as Tilemap;
                let tex = child.getTileset();
                for (let j = 0; j < tex.length; j++) {
                    if (tex[j].baseTexture === texture.baseTexture) {
                        layer = child;
                        ind = j;
                        break;
                    }
                }
                if (layer) {
                    break;
                }
            }

            if (!layer) {
                for (let i = 0; i < children.length; i++) {
                    let child = children[i] as Tilemap;
                    if (child.getTileset().length < this.texPerChild) {
                        layer = child;
                        ind = child.getTileset().length;
                        child.getTileset().push(texture);
                        break;
                    }
                }
                if (!layer) {
                    layer = new Tilemap(this.zIndex, texture);
                    layer.compositeParent = true;
                    layer.offsetX = Constant.boundSize;
                    layer.offsetY = Constant.boundSize;
                    this.addChild(layer);
                    ind = 0;
                }
            }
        }

        this._lastLayer = layer;
        layer.addRect(ind, texture.frame.x, texture.frame.y, x, y, texture.orig.width, texture.orig.height, animX, animY, texture.rotate, animWidth, animHeight);

        return this;
    }

    renderCanvas(renderer: CanvasRenderer): void
    {
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        const tilemapPlugin = renderer.plugins.tilemap;

        if (tilemapPlugin && !tilemapPlugin.dontUseTransform)
        {
            const wt = this.worldTransform;

            renderer.context.setTransform(
                wt.a,
                wt.b,
                wt.c,
                wt.d,
                wt.tx * renderer.resolution,
                wt.ty * renderer.resolution
            );
        }

        const layers = this.children;

        for (let i = 0; i < layers.length; i++)
        {
            const layer = (layers[i] as Tilemap);

            layer.tileAnim = this.tileAnim;
            layer.renderCanvasCore(renderer);
        }
    }

    render(renderer: Renderer): void
    {
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
        }

        const plugin = renderer.plugins.tilemap as TileRenderer;
        const shader = plugin.getShader();

        renderer.batch.setObjectRenderer(plugin);

        // TODO: dont create new array, please
        this._globalMat = shader.uniforms.projTransMatrix;
        renderer.globalUniforms.uniforms.projectionMatrix.copyTo(this._globalMat).append(this.worldTransform);
        shader.uniforms.shadowColor = this.shadowColor;
        shader.uniforms.animationFrame = this.tileAnim || plugin.tileAnim;

        renderer.shader.bind(shader, false);

        const layers = this.children;

        for (let i = 0; i < layers.length; i++)
        {
            (layers[i] as Tilemap).renderWebGLCore(renderer, plugin);
        }
    }

    /**
     * @internal
     * @ignore
     */
    isModified(anim: boolean): boolean
    {
        const layers = this.children;

        if (this.modificationMarker !== layers.length)
        {
            return true;
        }
        for (let i = 0; i < layers.length; i++)
        {
            if ((layers[i] as Tilemap).isModified(anim))
            {
                return true;
            }
        }

        return false;
    }

    /**
     * @internal
     * @ignore
     */
    clearModify(): void
    {
        const layers = this.children;

        this.modificationMarker = layers.length;
        for (let i = 0; i < layers.length; i++) {
            (layers[i] as Tilemap).clearModify();
        }
    }

    /**
     * @deprecated
     * @param zIndex - The z-index of the tilemap composite.
     * @param bitmaps - The tileset to use.
     * @param texPerChild - The number of textures per tilemap.
     */
    initialize(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number): void
    {
        if (texPerChild as any === true) {
            // old format, ignore it!
            texPerChild = 0;
        }

        this.z = this.zIndex = zIndex;
        this.texPerChild = texPerChild || Constant.boundCountPerBuffer * Constant.maxTextures;

        if (bitmaps)
        {
            this.setBitmaps(bitmaps);
        }
    }
}
