namespace pixi_tilemap {

    import glCore = PIXI.glCore;
    import GroupD8 = PIXI.GroupD8;

    export const POINT_STRUCT_SIZE = 12;

    export class RectTileLayer extends PIXI.Container {

        constructor(zIndex: number, texture: PIXI.Texture | Array<PIXI.Texture>) {
            super();
            this.initialize(zIndex, texture);
        }

        updateTransform() {
            super.displayObjectUpdateTransform()
        }

        z = 0;
        zIndex = 0;
        modificationMarker = 0;
        shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
        _globalMat: PIXI.Matrix = null;

        pointsBuf: Array<number> = [];
        hasAnim = false;
        textures: Array<PIXI.Texture>;

        offsetX = 0;
        offsetY = 0;
        compositeParent = false;

        initialize(zIndex: number, textures: PIXI.Texture | Array<PIXI.Texture>) {
            if (!textures) {
                textures = [];
            } else if (!(textures instanceof Array) && (textures as PIXI.Texture).baseTexture) {
                textures = [textures as PIXI.Texture];
            }
            this.textures = textures as Array<PIXI.Texture>;
            this.z = this.zIndex = zIndex;
            // this.visible = false;
        }

        clear() {
            this.pointsBuf.length = 0;
            this.modificationMarker = 0;
            this.hasAnim = false;
        }

        addFrame(texture_: PIXI.Texture | String | number, x: number, y: number, animX: number, animY: number) {
            var texture: PIXI.Texture;
            var textureIndex = 0;

            if (typeof texture_ === "number") {
                textureIndex = texture_;
                texture = this.textures[textureIndex];
            } else {
                if (typeof texture_ === "string") {
                    texture = PIXI.Texture.fromImage(texture_);
                } else {
                    texture = texture_ as PIXI.Texture;
                }

                var found = false;
                var textureList = this.textures;
                for (var i = 0; i < textureList.length; i++) {
                    if (textureList[i].baseTexture === texture.baseTexture) {
                        textureIndex = i;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    // textureIndex = this.textures.length;
                    // this.textures.push(texture);
                    return false;
                }
            }

            this.addRect(textureIndex, texture.frame.x, texture.frame.y, x, y, texture.frame.width, texture.frame.height, animX, animY);
            return true;
        }

        addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX: number = 0, animY: number = 0, rotate: number = 0, animWidth: number = 1, animHeight: number = 1) {
            const pb = this.pointsBuf;
            this.hasAnim = this.hasAnim || animX > 0 || animY > 0;

            pb.push(u);
            pb.push(v);
            pb.push(x);
            pb.push(y);
            pb.push(tileWidth);
            pb.push(tileHeight);
            pb.push(rotate);
            pb.push(animX);
            pb.push(animY);
            pb.push(textureIndex);
            pb.push(animWidth);
            pb.push(animHeight);
        }

        renderCanvas(renderer: PIXI.CanvasRenderer) {
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
            this.renderCanvasCore(renderer);
        }

        renderCanvasCore(renderer: PIXI.CanvasRenderer) {
            if (this.textures.length === 0) return;
            var points = this.pointsBuf;
            renderer.context.fillStyle = '#000000';
            for (var i = 0, n = points.length; i < n; i += POINT_STRUCT_SIZE) {
                var x1 = points[i], y1 = points[i + 1];
                var x2 = points[i + 2], y2 = points[i + 3];
                var w = points[i + 4];
                var h = points[i + 5];
                var rotate = points[i + 6];
                x1 += points[i + 7] * renderer.plugins.tilemap.tileAnim[0];
                y1 += points[i + 8] * renderer.plugins.tilemap.tileAnim[1];
                var textureIndex = points[i + 8];

                //canvas does not work with rotate!!!!

                if (textureIndex >= 0) {
                    renderer.context.drawImage(this.textures[textureIndex].baseTexture.source, x1, y1, w, h, x2, y2, w, h);
                } else {
                    renderer.context.globalAlpha = 0.5;
                    renderer.context.fillRect(x2, y2, w, h);
                    renderer.context.globalAlpha = 1;
                }
            }
        }

        vbId = 0;
        vb: any = null;
        vbBuffer: ArrayBuffer = null;
        vbArray: Float32Array = null;
        vbInts: Uint32Array = null;

        getVb(renderer: TileRenderer) {
            var _vb = this.vb;

            if (_vb) {
                if (_vb.rendererSN === renderer.sn) {
                    return _vb;
                }
                this.destroyVb();
            }

            return null;
        }

        destroyVb() {
            if (this.vb) {
                this.vb.vb.destroy();
                this.vb.vao.destroy();
                this.vb = null;
            }
        }

        renderWebGL(renderer: PIXI.WebGLRenderer) {
            var gl = renderer.gl;
            var plugin = renderer.plugins.simpleTilemap;
            var shader = plugin.getShader();
            renderer.setObjectRenderer(plugin);
            renderer.bindShader(shader);
            //TODO: dont create new array, please
            this._globalMat = this._globalMat || new PIXI.Matrix();
            renderer._activeRenderTarget.projectionMatrix.copy(this._globalMat).append(this.worldTransform);
            shader.uniforms.projectionMatrix = this._globalMat.toArray(true);
            shader.uniforms.shadowColor = this.shadowColor;
            var af = shader.uniforms.animationFrame = plugin.tileAnim;
            //shader.syncUniform(shader.uniforms.animationFrame);
            this.renderWebGLCore(renderer, plugin);
        }

        renderWebGLCore(renderer: PIXI.WebGLRenderer, plugin: PIXI.ObjectRenderer) {
            var points = this.pointsBuf;
            if (points.length === 0) return;
            var rectsCount = points.length / POINT_STRUCT_SIZE;
            var tile = plugin || renderer.plugins.simpleTilemap;
            var gl = renderer.gl;


            var shader = tile.getShader();
            var textures = this.textures;
            if (textures.length === 0) return;

            tile.bindTextures(renderer, shader, textures);

            //lost context! recover!
            var vb = this.getVb(tile as TileRenderer);
            if (!vb) {
                vb = tile.createVb();
                this.vb = vb;
                this.vbId = vb.id;
                this.vbBuffer = null;
                this.modificationMarker = 0;
            }
            var vao = vb.vao;
            renderer.bindVao(vao);

            tile.checkIndexBuffer(rectsCount);

            const boundCountPerBuffer = Constant.boundCountPerBuffer;

            var vertexBuf = vb.vb as glCore.GLBuffer;
            //if layer was changed, re-upload vertices
            vertexBuf.bind();
            var vertices = rectsCount * shader.vertPerQuad;
            if (vertices === 0) return;
            if (this.modificationMarker !== vertices) {
                this.modificationMarker = vertices;
                var vs = shader.stride * vertices;
                if (!this.vbBuffer || this.vbBuffer.byteLength < vs) {
                    //!@#$ happens, need resize
                    var bk = shader.stride;
                    while (bk < vs) {
                        bk *= 2;
                    }
                    this.vbBuffer = new ArrayBuffer(bk);
                    this.vbArray = new Float32Array(this.vbBuffer);
                    this.vbInts = new Uint32Array(this.vbBuffer);
                    vertexBuf.upload(this.vbBuffer, 0, true);
                }

                var arr = this.vbArray, ints = this.vbInts;
                //upload vertices!
                var sz = 0;
                //var tint = 0xffffffff;
                var textureId: number = 0;
                var shiftU: number = this.offsetX;
                var shiftV: number = this.offsetY;

                //var tint = 0xffffffff;
                var tint = -1;
                for (var i = 0; i < points.length; i += POINT_STRUCT_SIZE) {
                    var eps = 0.5;
                    if (this.compositeParent) {
                        if (boundCountPerBuffer > 1) {
                            //TODO: what if its more than 4?
                            textureId = (points[i + 9] >> 2);
                            shiftU = this.offsetX * (points[i + 9] & 1);
                            shiftV = this.offsetY * ((points[i + 9] >> 1) & 1);
                        } else {
                            textureId = points[i + 9];
                            shiftU = 0;
                            shiftV = 0;
                        }
                    }
                    let x = points[i + 2], y = points[i + 3];
                    let w = points[i + 4], h = points[i + 5];
                    let rotate = points[i + 6];
                    let u = points[i] + shiftU, v = points[i + 1] + shiftV;
                    let animX = points[i + 7], animY = points[i + 8];
                    var animWidth = points[i + 10], animHeight = points[i + 11];

                    let u0: number, v0: number, u1: number, v1: number, u2: number, v2: number, u3: number, v3: number;
                    if (rotate === 0) {
                        u0 = u;
                        v0 = v;
                        u1 = u + w;
                        v1 = v;
                        u2 = u + w;
                        v2 = v + h;
                        u3 = u;
                        v3 = v + h;
                    } else {
                        let w2 = w / 2;
                        let h2 = h / 2;
                        if (rotate % 4 !== 0) {
                            w2 = h / 2;
                            h2 = w / 2;
                        }
                        const cX = u + w2;
                        const cY = v + h2;

                        rotate = GroupD8.add(rotate, GroupD8.NW);
                        u0 = cX + (w2 * GroupD8.uX(rotate));
                        v0 = cY + (h2 * GroupD8.uY(rotate));

                        rotate = GroupD8.add(rotate, 2); // rotate 90 degrees clockwise
                        u1 = cX + (w2 * GroupD8.uX(rotate));
                        v1 = cY + (h2 * GroupD8.uY(rotate));

                        rotate = GroupD8.add(rotate, 2);
                        u2 = cX + (w2 * GroupD8.uX(rotate));
                        v2 = cY + (h2 * GroupD8.uY(rotate));

                        rotate = GroupD8.add(rotate, 2);
                        u3 = cX + (w2 * GroupD8.uX(rotate));
                        v3 = cY + (h2 * GroupD8.uY(rotate));
                    }

                    arr[sz++] = x;
                    arr[sz++] = y;
                    arr[sz++] = u0;
                    arr[sz++] = v0;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = textureId;
                    arr[sz++] = animWidth;
                    arr[sz++] = animHeight;
                    arr[sz++] = x + w;
                    arr[sz++] = y;
                    arr[sz++] = u1;
                    arr[sz++] = v1;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = textureId;
                    arr[sz++] = animWidth;
                    arr[sz++] = animHeight;
                    arr[sz++] = x + w;
                    arr[sz++] = y + h;
                    arr[sz++] = u2;
                    arr[sz++] = v2;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = textureId;
                    arr[sz++] = animWidth;
                    arr[sz++] = animHeight;
                    arr[sz++] = x;
                    arr[sz++] = y + h;
                    arr[sz++] = u3;
                    arr[sz++] = v3;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = textureId;
                    arr[sz++] = animWidth;
                    arr[sz++] = animHeight;
                }

                // if (vs > this.vbArray.length/2 ) {
                vertexBuf.upload(arr, 0, true);
                // } else {
                //     var view = arr.subarray(0, vs);
                //     vb.upload(view, 0);
                // }
            }
            gl.drawElements(gl.TRIANGLES, rectsCount * 6, gl.UNSIGNED_SHORT, 0);
        }

        isModified(anim: boolean) {
            if (this.modificationMarker !== this.pointsBuf.length ||
                anim && this.hasAnim) {
                return true;
            }
            return false;
        }

        clearModify() {
            this.modificationMarker = this.pointsBuf.length;
        }

        destroy(options?: PIXI.DestroyOptions | boolean) {
            super.destroy(options);
            this.destroyVb();
        }
    }

}
