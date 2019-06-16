namespace pixi_tilemap {
    export class RectTileLayer extends PIXI.Container {

        constructor(zIndex: number, texture: PIXI.Texture | Array<PIXI.Texture>) {
            super();
            this.initialize(zIndex, texture);
        }

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
            this.zIndex = zIndex;
            // this.visible = false;
        }

        clear() {
            this.pointsBuf.length = 0;
            this.modificationMarker = 0;
            this.hasAnim = false;
        }

        addFrame(texture_: PIXI.Texture | String | number, x: number, y: number, animX: number, animY: number) {
            let texture: PIXI.Texture;
            let textureIndex = 0;

            if (typeof texture_ === "number") {
                textureIndex = texture_;
                texture = this.textures[textureIndex];
            } else {
                if (typeof texture_ === "string") {
                    texture = PIXI.Texture.fromImage(texture_);
                } else {
                    texture = texture_ as PIXI.Texture;
                }

                let found = false;
                let textureList = this.textures;
                for (let i = 0; i < textureList.length; i++) {
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

        addRect(textureIndex: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number, animX: number = 0, animY: number = 0) {
            let pb = this.pointsBuf;
            this.hasAnim = this.hasAnim || animX > 0 || animY > 0;
            if (tileWidth === tileHeight) {
                pb.push(u);
                pb.push(v);
                pb.push(x);
                pb.push(y);
                pb.push(tileWidth);
                pb.push(tileHeight);
                pb.push(animX | 0);
                pb.push(animY | 0);
                pb.push(textureIndex);
            } else {
                let i: number;
                if (tileWidth % tileHeight === 0) {
                    //horizontal line on squares
                    for (i = 0; i < tileWidth / tileHeight; i++) {
                        pb.push(u + i * tileHeight);
                        pb.push(v);
                        pb.push(x + i * tileHeight);
                        pb.push(y);
                        pb.push(tileHeight);
                        pb.push(tileHeight);
                        pb.push(animX | 0);
                        pb.push(animY | 0);
                        pb.push(textureIndex);
                    }
                } else if (tileHeight % tileWidth === 0) {
                    //vertical line on squares
                    for (i = 0; i < tileHeight / tileWidth; i++) {
                        pb.push(u);
                        pb.push(v + i * tileWidth);
                        pb.push(x);
                        pb.push(y + i * tileWidth);
                        pb.push(tileWidth);
                        pb.push(tileWidth);
                        pb.push(animX | 0);
                        pb.push(animY | 0);
                        pb.push(textureIndex);
                    }
                } else {
                    //ok, ok, lets use rectangle
                    pb.push(u);
                    pb.push(v);
                    pb.push(x);
                    pb.push(y);
                    pb.push(tileWidth);
                    pb.push(tileHeight);
                    pb.push(animX | 0);
                    pb.push(animY | 0);
                    pb.push(textureIndex);
                }
            }
        }

        renderCanvas(renderer: PIXI.CanvasRenderer) {
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
            this.renderCanvasCore(renderer);
        }

        renderCanvasCore(renderer: PIXI.CanvasRenderer) {
            if (this.textures.length === 0) return;
            let points = this.pointsBuf;
            renderer.context.fillStyle = '#000000';
            for (let i = 0, n = points.length; i < n; i += 9) {
                let x1 = points[i], y1 = points[i + 1];
                let x2 = points[i + 2], y2 = points[i + 3];
                let w = points[i + 4];
                let h = points[i + 5];
                x1 += points[i + 6] * renderer.plugins.tilemap.tileAnim[0];
                y1 += points[i + 7] * renderer.plugins.tilemap.tileAnim[1];
                let textureIndex = points[i + 8];
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
            let _vb = this.vb;

            if (_vb) {
                if (_vb.rendererSN === renderer.sn){
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
            let gl = renderer.gl;
            let plugin = renderer.plugins.simpleTilemap;
            let shader = plugin.getShader();
            renderer.setObjectRenderer(plugin);
            renderer.bindShader(shader);
            //TODO: dont create new array, please
            this._globalMat = this._globalMat || new PIXI.Matrix();
            renderer._activeRenderTarget.projectionMatrix.copy(this._globalMat).append(this.worldTransform);
            shader.uniforms.projectionMatrix = this._globalMat.toArray(true);
            shader.uniforms.shadowColor = this.shadowColor;
            let af = shader.uniforms.animationFrame = plugin.tileAnim;
            //shader.syncUniform(shader.uniforms.animationFrame);
            this.renderWebGLCore(renderer, plugin);
        }

        renderWebGLCore(renderer: PIXI.WebGLRenderer, plugin: PIXI.ObjectRenderer) {
            let points = this.pointsBuf;
            if (points.length === 0) return;
            let rectsCount = points.length / 9;
            let tile = plugin || renderer.plugins.simpleTilemap;
            let gl = renderer.gl;


            let shader = tile.getShader();
            let textures = this.textures;
            if (textures.length === 0) return;

            tile.bindTextures(renderer, shader, textures);

            //lost context! recover!
            let vb = this.getVb(tile as TileRenderer);
            if (!vb) {
                vb = tile.createVb();
                this.vb = vb;
                this.vbId = vb.id;
                this.vbBuffer = null;
                this.modificationMarker = 0;
            }
            let vao = vb.vao;
            renderer.bindVao(vao);

            tile.checkIndexBuffer(rectsCount);

            const boundCountPerBuffer = Constant.boundCountPerBuffer;

            let vertexBuf = vb.vb as glCore.GLBuffer;
            //if layer was changed, re-upload vertices
            vertexBuf.bind();
            let vertices = rectsCount * shader.vertPerQuad;
            if (vertices === 0) return;
            if (this.modificationMarker !== vertices) {
                this.modificationMarker = vertices;
                let vs = shader.stride * vertices;
                if (!this.vbBuffer || this.vbBuffer.byteLength < vs) {
                    //!@#$ happens, need resize
                    let bk = shader.stride;
                    while (bk < vs) {
                        bk *= 2;
                    }
                    this.vbBuffer = new ArrayBuffer(bk);
                    this.vbArray = new Float32Array(this.vbBuffer);
                    this.vbInts = new Uint32Array(this.vbBuffer);
                    vertexBuf.upload(this.vbBuffer, 0, true);
                }

                let arr = this.vbArray, ints = this.vbInts;
                //upload vertices!
                let sz = 0;
                //let tint = 0xffffffff;
                let textureId: number = 0;
                let shiftU: number = this.offsetX;
                let shiftV: number = this.offsetY;

                //let tint = 0xffffffff;
                let tint = -1;
                for (let i = 0; i < points.length; i += 9) {
                    let eps = 0.5;
                    if (this.compositeParent){
                        if (boundCountPerBuffer > 1) {
                            //TODO: what if its more than 4?
                            textureId = (points[i + 8] >> 2);
                            shiftU = this.offsetX * (points[i + 8] & 1);
                            shiftV = this.offsetY * ((points[i + 8] >> 1) & 1);
                        } else {
                            textureId = points[i + 8];
                            shiftU = 0;
                            shiftV = 0;
                        }
                    }
                    let x = points[i + 2], y = points[i + 3];
                    let w = points[i + 4], h = points[i + 5];
                    let u = points[i] + shiftU, v = points[i + 1] + shiftV;
                    let animX = points[i + 6], animY = points[i + 7];
                    arr[sz++] = x;
                    arr[sz++] = y;
                    arr[sz++] = u;
                    arr[sz++] = v;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = textureId;
                    arr[sz++] = x + w;
                    arr[sz++] = y;
                    arr[sz++] = u + w;
                    arr[sz++] = v;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = textureId;
                    arr[sz++] = x + w;
                    arr[sz++] = y + h;
                    arr[sz++] = u + w;
                    arr[sz++] = v + h;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = textureId;
                    arr[sz++] = x;
                    arr[sz++] = y + h;
                    arr[sz++] = u;
                    arr[sz++] = v + h;
                    arr[sz++] = u + eps;
                    arr[sz++] = v + eps;
                    arr[sz++] = u + w - eps;
                    arr[sz++] = v + h - eps;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = textureId;
                }

                // if (vs > this.vbArray.length/2 ) {
                vertexBuf.upload(arr, 0, true);
                // } else {
                //     let view = arr.subarray(0, vs);
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
