/// <reference types="pixi.js" />

namespace pixi_tilemap {

    export class CompositeRectTileLayer extends PIXI.Container {

        constructor(zIndex?: number, bitmaps?: Array<PIXI.Texture>, texPerChild?: number) {
            super();
            this.initialize.apply(this, arguments);
        }

        updateTransform() {
            super.displayObjectUpdateTransform()
        }

        z: number;
        zIndex: number;
        modificationMarker = 0;
        shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
        _globalMat: PIXI.Matrix = null;

        texPerChild: number;

        initialize(zIndex?: number, bitmaps?: Array<PIXI.Texture>, texPerChild?: number) {
            if (texPerChild as any === true) {
                //old format, ignore it!
                texPerChild = 0;
            }
            this.z = this.zIndex = zIndex;
            this.texPerChild = texPerChild || Constant.boundCountPerBuffer * Constant.maxTextures;
            if (bitmaps) {
                this.setBitmaps(bitmaps);
            }
        }

        setBitmaps(bitmaps: Array<PIXI.Texture>) {
            var texPerChild = this.texPerChild;
            var len1 = this.children.length;
            var len2 = Math.ceil(bitmaps.length / texPerChild);
            var i: number;
            for (i = 0; i < len1; i++) {
                (this.children[i] as RectTileLayer).textures = bitmaps.slice(i * texPerChild, (i + 1) * texPerChild);
            }
            for (i = len1; i < len2; i++) {
                var layer = new RectTileLayer(this.zIndex, bitmaps.slice(i * texPerChild, (i + 1) * texPerChild));
                layer.compositeParent = true;
                layer.offsetX = Constant.boundSize;
                layer.offsetY = Constant.boundSize;
                this.addChild(layer);
            }
        }

        clear() {
            for (var i = 0; i < this.children.length; i++) {
                (this.children[i] as RectTileLayer).clear();
            }
            this.modificationMarker = 0;
        }

        addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX?: number, animY?: number, rotate?: number, animWidth?: number, animHeight?: number) {
            const childIndex: number = textureIndex / this.texPerChild >> 0;
            const textureId: number = textureIndex % this.texPerChild;

            if (this.children[childIndex] && (this.children[childIndex] as RectTileLayer).textures) {
                (this.children[childIndex] as RectTileLayer).addRect(textureId, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate, animWidth, animHeight);
            }
        }

        addFrame(texture_: PIXI.Texture | String | number, x: number, y: number, animX?: number, animY?: number, animWidth?: number, animHeight?: number) {
            var texture: PIXI.Texture;
            var layer: RectTileLayer = null;
            var ind: number = 0;
            var children = this.children;

            if (typeof texture_ === "number") {
                var childIndex = texture_ / this.texPerChild >> 0;
                layer = children[childIndex] as RectTileLayer;

                if (!layer) {
                    layer = children[0] as RectTileLayer;
                    if (!layer) {
                        return false;
                    }
                    ind = 0;
                } else {
                    ind = texture_ % this.texPerChild;
                }

                texture = layer.textures[ind];
            } else {
                if (typeof texture_ === "string") {
                    texture = PIXI.Texture.fromImage(texture_);
                } else {
                    texture = texture_ as PIXI.Texture;
                }

                for (var i = 0; i < children.length; i++) {
                    var child = children[i] as RectTileLayer;
                    var tex = child.textures;
                    for (var j = 0; j < tex.length; j++) {
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
                    for (i = 0; i < children.length; i++) {
                        var child = children[i] as RectTileLayer;
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

            layer.addRect(ind, texture.frame.x, texture.frame.y, x, y, texture.orig.width, texture.orig.height, animX, animY, texture.rotate, animWidth, animHeight);
            return true;
        }

        renderCanvas(renderer: PIXI.CanvasRenderer) {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            var plugin = renderer.plugins.tilemap;
            if (!plugin.dontUseTransform) {
                var wt = this.worldTransform;
                renderer.context.setTransform(
                    wt.a,
                    wt.b,
                    wt.c,
                    wt.d,
                    wt.tx * renderer.resolution,
                    wt.ty * renderer.resolution
                );
            }
            var layers = this.children;
            for (var i = 0; i < layers.length; i++) {
                (layers[i] as RectTileLayer).renderCanvasCore(renderer);
            }
        }

        renderWebGL(renderer: PIXI.WebGLRenderer) {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            var gl = renderer.gl;
            var plugin = renderer.plugins.tilemap;
            renderer.setObjectRenderer(plugin);
            var shader = plugin.getShader();
            renderer.bindShader(shader);
            //TODO: dont create new array, please
            this._globalMat = this._globalMat || new PIXI.Matrix();
            renderer._activeRenderTarget.projectionMatrix.copy(this._globalMat).append(this.worldTransform);
            shader.uniforms.projectionMatrix = this._globalMat.toArray(true);
            shader.uniforms.shadowColor = this.shadowColor;
            var af = shader.uniforms.animationFrame = plugin.tileAnim;
            //shader.syncUniform(shader.uniforms.animationFrame);
            var layers = this.children;
            for (var i = 0; i < layers.length; i++) {
                (layers[i] as RectTileLayer).renderWebGLCore(renderer, plugin);
            }
        }

        isModified(anim: boolean) {
            var layers = this.children;
            if (this.modificationMarker !== layers.length) {
                return true;
            }
            for (var i = 0; i < layers.length; i++) {
                if ((layers[i] as RectTileLayer).isModified(anim)) {
                    return true;
                }
            }
            return false;
        }

        clearModify() {
            var layers = this.children;
            this.modificationMarker = layers.length;
            for (var i = 0; i < layers.length; i++) {
                (layers[i] as RectTileLayer).clearModify();
            }
        }
    }

}
