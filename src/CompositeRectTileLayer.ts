/// <reference types="pixi.js" />

module PIXI.tilemap {
    export class CompositeRectTileLayer extends PIXI.Container {
        constructor(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number) {
            super();
            this.initialize.apply(this, arguments);
        }

        updateTransform() {
            super.displayObjectUpdateTransform()
        }

        z: number;
        zIndex: number;
        shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
        texPerChild: number;
        modificationMarker = 0;
        _globalMat: PIXI.Matrix = null;
        // _tempScale: Array<number> = null;

        initialize(zIndex?: number, bitmaps?: Array<Texture>, texPerChild?: number) {
            this.z = this.zIndex = zIndex;
            this.texPerChild = texPerChild || 16;
            if (bitmaps) {
                this.setBitmaps(bitmaps);
            }
        }

        setBitmaps(bitmaps: Array<Texture>) {
            var texPerChild = this.texPerChild;
            var len1 = this.children.length;
            var len2 = Math.ceil(bitmaps.length / texPerChild);
            var i: number;
            for (i = 0; i < len1; i++) {
                (this.children[i] as RectTileLayer).textures = bitmaps.slice(i * texPerChild, (i + 1) * texPerChild);
            }
            for (i = len1; i < len2; i++) {
                this.addChild(new RectTileLayer(this.zIndex, bitmaps.slice(i * texPerChild, (i + 1) * texPerChild)));
            }
        }

        clear() {
            for (var i = 0; i < this.children.length; i++)
                (this.children[i] as RectTileLayer).clear();
            this.modificationMarker = 0;
        }

        addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number) {
            const childIndex : number = textureIndex / this.texPerChild >> 0;
            const textureId : number = textureIndex % this.texPerChild;

            if (this.children[childIndex] && (this.children[childIndex] as RectTileLayer).textures)
                (this.children[childIndex] as RectTileLayer).addRect(textureId, u, v, x, y, tileWidth, tileHeight);
        }

        addFrame(texture_: PIXI.Texture | String | number, x: number, y: number, animX: number, animY: number) {
            var texture : PIXI.Texture;
            var layer : RectTileLayer = null, ind = 0;
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
                        children.push(layer = new RectTileLayer(this.zIndex, texture));
                        ind = 0;
                    }
                }
            }

            layer.addRect(ind, texture.frame.x, texture.frame.y, x, y, texture.frame.width, texture.frame.height, animX, animY);
            return true;
        };

        renderCanvas(renderer: CanvasRenderer) {
            if (!renderer.plugins.tilemap.dontUseTransform) {
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
            for (var i = 0; i < layers.length; i++)
                layers[i].renderCanvas(renderer);
        };

        renderWebGL(renderer: WebGLRenderer) {
            var gl = renderer.gl;
            var shader = renderer.plugins.tilemap.getShader();
            renderer.setObjectRenderer(renderer.plugins.tilemap);
            renderer.bindShader(shader);
            //TODO: dont create new array, please
            this._globalMat = this._globalMat || new PIXI.Matrix();
            renderer._activeRenderTarget.projectionMatrix.copy(this._globalMat).append(this.worldTransform);
            shader.uniforms.projectionMatrix = this._globalMat.toArray(true);
            shader.uniforms.shadowColor = this.shadowColor;
            var af = shader.uniforms.animationFrame = renderer.plugins.tilemap.tileAnim;
            //shader.syncUniform(shader.uniforms.animationFrame);
            var layers = this.children;
            for (var i = 0; i < layers.length; i++)
                (layers[i] as RectTileLayer).renderWebGL(renderer);
        }

        isModified(anim: boolean) {
            var layers = this.children;
            if (this.modificationMarker != layers.length) {
                return true;
            }
            for (var i = 0; i < layers.length; i++) {
                const layer = layers[i] as RectTileLayer;
                if (layer.modificationMarker != layer.pointsBuf.length ||
                    anim && layer.hasAnim) {
                    return true;
                }
            }
            return false;
        }

        clearModify() {
            var layers = this.children;
            this.modificationMarker = layers.length;
            for (var i = 0; i < layers.length; i++) {
                const layer = layers[i] as RectTileLayer;
                layer.modificationMarker = layer.pointsBuf.length;
            }
        }

    }
}
