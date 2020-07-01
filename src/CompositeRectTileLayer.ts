/// <reference types="pixi.js" />

namespace pixi_tilemap {

    export class CompositeRectTileLayer extends PIXI.Container {

        constructor(zIndex?: number, bitmaps?: Array<PIXI.Texture>, texPerChild?: number, alpha?: number) {
            super();
            this.initialize.apply(this, arguments);
        }

        updateTransform() {
            (this as any).displayObjectUpdateTransform();
        }

        z: number;
        zIndex: number;
        modificationMarker = 0;
        shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
        _globalMat: PIXI.Matrix = null;
        _lastLayer: RectTileLayer = null;

        texPerChild: number;

        initialize(zIndex?: number, bitmaps?: Array<PIXI.Texture>, texPerChild?: number, alpha?: number) {
            if (texPerChild as any === true) {
                //old format, ignore it!
                texPerChild = 0;
            }
            this.z = this.zIndex = zIndex;
            this.texPerChild = texPerChild || Constant.boundCountPerBuffer * Constant.maxTextures;
            this.alpha = alpha ?? 1.0;
            if (bitmaps) {
                this.setBitmaps(bitmaps);
            }
        }

        setBitmaps(bitmaps: Array<PIXI.Texture>) {
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
                (this.children[i] as RectTileLayer).textures = bitmaps.slice(i * texPerChild, (i + 1) * texPerChild);
            }
            for (i = len1; i < len2; i++) {
                let layer = new RectTileLayer(this.zIndex, bitmaps.slice(i * texPerChild, (i + 1) * texPerChild));
                layer.compositeParent = true;
                layer.offsetX = Constant.boundSize;
                layer.offsetY = Constant.boundSize;
                this.addChild(layer);
            }
        }

        clear() {
            for (let i = 0; i < this.children.length; i++) {
                (this.children[i] as RectTileLayer).clear();
            }
            this.modificationMarker = 0;
        }

        addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX?: number, animY?: number, rotate?: number, animWidth?: number, animHeight?: number, alpha?: number): this {
            const childIndex: number = textureIndex / this.texPerChild >> 0;
            const textureId: number = textureIndex % this.texPerChild;

            if (this.children[childIndex] && (this.children[childIndex] as RectTileLayer).textures) {
                this._lastLayer = (this.children[childIndex] as RectTileLayer);
                const tileAlpha = this.worldAlpha * (alpha ?? 1.0);
                this._lastLayer.addRect(textureId, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate, animWidth, animHeight, tileAlpha);
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

        /**
         * Set an specified alpha to the tile. By default, alpha is inherit from the tile's
         * CompositeRectTileLayer unless it is overridden with this method.
         *
         * @param {number} alpha Numeric value between 0.0 and 1.0.
         */
        tileAlpha(alpha: number) {
            if (this._lastLayer) {
                this._lastLayer.tileAlpha(this.worldAlpha * alpha);
            }
            return this;
        }

        addFrame(texture_: PIXI.Texture | String | number, x: number, y: number, animX?: number, animY?: number, animWidth?: number, animHeight?: number, alpha?: number): this {
            let texture: PIXI.Texture;
            let layer: RectTileLayer = null;
            let ind: number = 0;
            let children = this.children;

            this._lastLayer = null;
            if (typeof texture_ === "number") {
                let childIndex = texture_ / this.texPerChild >> 0;
                layer = children[childIndex] as RectTileLayer;

                if (!layer) {
                    layer = children[0] as RectTileLayer;
                    if (!layer) {
                        return this;
                    }
                    ind = 0;
                } else {
                    ind = texture_ % this.texPerChild;
                }

                texture = layer.textures[ind];
            } else {
                if (typeof texture_ === "string") {
                    texture = PIXI.Texture.from(texture_);
                } else {
                    texture = texture_ as PIXI.Texture;
                }

                for (let i = 0; i < children.length; i++) {
                    let child = children[i] as RectTileLayer;
                    let tex = child.textures;
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
                        let child = children[i] as RectTileLayer;
                        if (child.textures.length < this.texPerChild) {
                            layer = child;
                            ind = child.textures.length;
                            child.textures.push(texture);
                            break;
                        }
                    }
                    if (!layer) {
                        layer = new RectTileLayer(this.zIndex, texture);
                        layer.compositeParent = true;
                        layer.offsetX = Constant.boundSize;
                        layer.offsetY = Constant.boundSize;
                        children.push(layer);
                        ind = 0;
                    }
                }
            }

            this._lastLayer = layer;
            const tileAlpha = this.worldAlpha * (alpha ?? 1.0);
            layer.addRect(ind, texture.frame.x, texture.frame.y, x, y, texture.orig.width, texture.orig.height, animX, animY, texture.rotate, animWidth, animHeight, tileAlpha);
            return this;
        }

        renderCanvas(renderer: any) {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            let plugin = renderer.plugins.tilemap;
            if (!plugin.dontUseTransform) {
                let wt = this.worldTransform;
                renderer.context.setTransform(
                    wt.a,
                    wt.b,
                    wt.c,
                    wt.d,
                    wt.tx * renderer.resolution,
                    wt.ty * renderer.resolution
                );
            }
            let layers = this.children;
            for (let i = 0; i < layers.length; i++) {
                (layers[i] as RectTileLayer).renderCanvasCore(renderer);
            }
        }

        render(renderer: PIXI.Renderer) {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            let plugin = (renderer.plugins as any)['tilemap'];
            let shader = plugin.getShader();
            renderer.batch.setObjectRenderer(plugin);
            //TODO: dont create new array, please
            this._globalMat = shader.uniforms.projTransMatrix;
            renderer.globalUniforms.uniforms.projectionMatrix.copyTo(this._globalMat).append(this.worldTransform);
            shader.uniforms.shadowColor = this.shadowColor;
            shader.uniforms.animationFrame = plugin.tileAnim;
            renderer.shader.bind(shader, false);
            let layers = this.children;
            for (let i = 0; i < layers.length; i++) {
                (layers[i] as RectTileLayer).renderWebGLCore(renderer, plugin);
            }
        }

        isModified(anim: boolean) {
            let layers = this.children;
            if (this.modificationMarker !== layers.length) {
                return true;
            }
            for (let i = 0; i < layers.length; i++) {
                if ((layers[i] as RectTileLayer).isModified(anim)) {
                    return true;
                }
            }
            return false;
        }

        clearModify() {
            let layers = this.children;
            this.modificationMarker = layers.length;
            for (let i = 0; i < layers.length; i++) {
                (layers[i] as RectTileLayer).clearModify();
            }
        }
    }

}
