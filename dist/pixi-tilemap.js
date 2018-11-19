var pixi_tilemap;
(function (pixi_tilemap) {
    var CanvasTileRenderer = (function () {
        function CanvasTileRenderer(renderer) {
            this.tileAnim = [0, 0];
            this.dontUseTransform = false;
            this.renderer = renderer;
            this.tileAnim = [0, 0];
        }
        return CanvasTileRenderer;
    }());
    pixi_tilemap.CanvasTileRenderer = CanvasTileRenderer;
    PIXI.CanvasRenderer.registerPlugin('tilemap', CanvasTileRenderer);
})(pixi_tilemap || (pixi_tilemap = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var pixi_tilemap;
(function (pixi_tilemap) {
    var CompositeRectTileLayer = (function (_super) {
        __extends(CompositeRectTileLayer, _super);
        function CompositeRectTileLayer(zIndex, bitmaps, texPerChild) {
            var _this = _super.call(this) || this;
            _this.modificationMarker = 0;
            _this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
            _this._globalMat = null;
            _this.initialize.apply(_this, arguments);
            return _this;
        }
        CompositeRectTileLayer.prototype.updateTransform = function () {
            _super.prototype.displayObjectUpdateTransform.call(this);
        };
        CompositeRectTileLayer.prototype.initialize = function (zIndex, bitmaps, texPerChild) {
            if (texPerChild === true) {
                texPerChild = 0;
            }
            this.z = this.zIndex = zIndex;
            this.texPerChild = texPerChild || pixi_tilemap.Constant.boundCountPerBuffer * pixi_tilemap.Constant.maxTextures;
            if (bitmaps) {
                this.setBitmaps(bitmaps);
            }
        };
        CompositeRectTileLayer.prototype.setBitmaps = function (bitmaps) {
            var texPerChild = this.texPerChild;
            var len1 = this.children.length;
            var len2 = Math.ceil(bitmaps.length / texPerChild);
            var i;
            for (i = 0; i < len1; i++) {
                this.children[i].textures = bitmaps.slice(i * texPerChild, (i + 1) * texPerChild);
            }
            for (i = len1; i < len2; i++) {
                var layer = new pixi_tilemap.RectTileLayer(this.zIndex, bitmaps.slice(i * texPerChild, (i + 1) * texPerChild));
                layer.compositeParent = true;
                layer.offsetX = pixi_tilemap.Constant.boundSize;
                layer.offsetY = pixi_tilemap.Constant.boundSize;
                this.addChild(layer);
            }
        };
        CompositeRectTileLayer.prototype.clear = function () {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].clear();
            }
            this.modificationMarker = 0;
        };
        CompositeRectTileLayer.prototype.addRect = function (textureIndex, u, v, x, y, tileWidth, tileHeight) {
            var childIndex = textureIndex / this.texPerChild >> 0;
            var textureId = textureIndex % this.texPerChild;
            if (this.children[childIndex] && this.children[childIndex].textures) {
                this.children[childIndex].addRect(textureId, u, v, x, y, tileWidth, tileHeight);
            }
        };
        CompositeRectTileLayer.prototype.addFrame = function (texture_, x, y, animX, animY) {
            var texture;
            var layer = null;
            var ind = 0;
            var children = this.children;
            if (typeof texture_ === "number") {
                var childIndex = texture_ / this.texPerChild >> 0;
                layer = children[childIndex];
                if (!layer) {
                    layer = children[0];
                    if (!layer) {
                        return false;
                    }
                    ind = 0;
                }
                else {
                    ind = texture_ % this.texPerChild;
                }
                texture = layer.textures[ind];
            }
            else {
                if (typeof texture_ === "string") {
                    texture = PIXI.Texture.fromImage(texture_);
                }
                else {
                    texture = texture_;
                }
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
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
                        var child = children[i];
                        if (child.textures.length < this.texPerChild) {
                            layer = child;
                            ind = child.textures.length;
                            child.textures.push(texture);
                            break;
                        }
                    }
                    if (!layer) {
                        layer = new pixi_tilemap.RectTileLayer(this.zIndex, texture);
                        layer.compositeParent = true;
                        layer.offsetX = pixi_tilemap.Constant.boundSize;
                        layer.offsetY = pixi_tilemap.Constant.boundSize;
                        children.push(layer);
                        ind = 0;
                    }
                }
            }
            layer.addRect(ind, texture.frame.x, texture.frame.y, x, y, texture.frame.width, texture.frame.height, animX, animY);
            return true;
        };
        CompositeRectTileLayer.prototype.renderCanvas = function (renderer) {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            var plugin = renderer.plugins.tilemap;
            if (!plugin.dontUseTransform) {
                var wt = this.worldTransform;
                renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderer.resolution, wt.ty * renderer.resolution);
            }
            var layers = this.children;
            for (var i = 0; i < layers.length; i++) {
                layers[i].renderCanvasCore(renderer);
            }
        };
        CompositeRectTileLayer.prototype.renderWebGL = function (renderer) {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            var gl = renderer.gl;
            var plugin = renderer.plugins.tilemap;
            renderer.setObjectRenderer(plugin);
            var shader = plugin.getShader();
            renderer.bindShader(shader);
            this._globalMat = this._globalMat || new PIXI.Matrix();
            renderer._activeRenderTarget.projectionMatrix.copy(this._globalMat).append(this.worldTransform);
            shader.uniforms.projectionMatrix = this._globalMat.toArray(true);
            shader.uniforms.shadowColor = this.shadowColor;
            var af = shader.uniforms.animationFrame = plugin.tileAnim;
            var layers = this.children;
            for (var i = 0; i < layers.length; i++) {
                layers[i].renderWebGLCore(renderer, plugin);
            }
        };
        CompositeRectTileLayer.prototype.isModified = function (anim) {
            var layers = this.children;
            if (this.modificationMarker !== layers.length) {
                return true;
            }
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].isModified(anim)) {
                    return true;
                }
            }
            return false;
        };
        CompositeRectTileLayer.prototype.clearModify = function () {
            var layers = this.children;
            this.modificationMarker = layers.length;
            for (var i = 0; i < layers.length; i++) {
                layers[i].clearModify();
            }
        };
        return CompositeRectTileLayer;
    }(PIXI.Container));
    pixi_tilemap.CompositeRectTileLayer = CompositeRectTileLayer;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    pixi_tilemap.Constant = {
        maxTextures: 4,
        bufferSize: 2048,
        boundSize: 1024,
        boundCountPerBuffer: 4,
    };
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var GraphicsLayer = (function (_super) {
        __extends(GraphicsLayer, _super);
        function GraphicsLayer(zIndex) {
            var _this = _super.call(this) || this;
            _this.z = _this.zIndex = zIndex;
            return _this;
        }
        GraphicsLayer.prototype.renderCanvas = function (renderer) {
            var wt = null;
            if (renderer.plugins.tilemap.dontUseTransform) {
                wt = this.transform.worldTransform;
                this.transform.worldTransform = PIXI.Matrix.IDENTITY;
            }
            renderer.plugins.graphics.render(this);
            if (renderer.plugins.tilemap.dontUseTransform) {
                this.transform.worldTransform = wt;
            }
            renderer.context.globalAlpha = 1.0;
        };
        GraphicsLayer.prototype.renderWebGL = function (renderer) {
            if (!this._webGL[renderer.CONTEXT_UID])
                this.dirty++;
            _super.prototype.renderWebGL.call(this, renderer);
        };
        GraphicsLayer.prototype.isModified = function (anim) {
            return false;
        };
        GraphicsLayer.prototype.clearModify = function () {
        };
        return GraphicsLayer;
    }(PIXI.Graphics));
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var RectTileLayer = (function (_super) {
        __extends(RectTileLayer, _super);
        function RectTileLayer(zIndex, texture) {
            var _this = _super.call(this) || this;
            _this.z = 0;
            _this.zIndex = 0;
            _this.modificationMarker = 0;
            _this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
            _this._globalMat = null;
            _this.pointsBuf = [];
            _this.hasAnim = false;
            _this.offsetX = 0;
            _this.offsetY = 0;
            _this.compositeParent = false;
            _this.vbId = 0;
            _this.vbBuffer = null;
            _this.vbArray = null;
            _this.vbInts = null;
            _this.initialize(zIndex, texture);
            return _this;
        }
        RectTileLayer.prototype.updateTransform = function () {
            _super.prototype.displayObjectUpdateTransform.call(this);
        };
        RectTileLayer.prototype.initialize = function (zIndex, textures) {
            if (!textures) {
                textures = [];
            }
            else if (!(textures instanceof Array) && textures.baseTexture) {
                textures = [textures];
            }
            this.textures = textures;
            this.z = this.zIndex = zIndex;
        };
        RectTileLayer.prototype.clear = function () {
            this.pointsBuf.length = 0;
            this.modificationMarker = 0;
            this.hasAnim = false;
        };
        RectTileLayer.prototype.addFrame = function (texture_, x, y, animX, animY) {
            var texture;
            var textureIndex = 0;
            if (typeof texture_ === "number") {
                textureIndex = texture_;
                texture = this.textures[textureIndex];
            }
            else {
                if (typeof texture_ === "string") {
                    texture = PIXI.Texture.fromImage(texture_);
                }
                else {
                    texture = texture_;
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
                    return false;
                }
            }
            this.addRect(textureIndex, texture.frame.x, texture.frame.y, x, y, texture.frame.width, texture.frame.height, animX, animY);
            return true;
        };
        RectTileLayer.prototype.addRect = function (textureIndex, u, v, x, y, tileWidth, tileHeight, animX, animY) {
            if (animX === void 0) { animX = 0; }
            if (animY === void 0) { animY = 0; }
            var pb = this.pointsBuf;
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
            }
            else {
                var i;
                if (tileWidth % tileHeight === 0) {
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
                }
                else if (tileHeight % tileWidth === 0) {
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
                }
                else {
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
        };
        RectTileLayer.prototype.renderCanvas = function (renderer) {
            var plugin = renderer.plugins.tilemap;
            if (!plugin.dontUseTransform) {
                var wt = this.worldTransform;
                renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderer.resolution, wt.ty * renderer.resolution);
            }
            this.renderCanvasCore(renderer);
        };
        RectTileLayer.prototype.renderCanvasCore = function (renderer) {
            if (this.textures.length === 0)
                return;
            var points = this.pointsBuf;
            renderer.context.fillStyle = '#000000';
            for (var i = 0, n = points.length; i < n; i += 9) {
                var x1 = points[i], y1 = points[i + 1];
                var x2 = points[i + 2], y2 = points[i + 3];
                var w = points[i + 4];
                var h = points[i + 5];
                x1 += points[i + 6] * renderer.plugins.tilemap.tileAnim[0];
                y1 += points[i + 7] * renderer.plugins.tilemap.tileAnim[1];
                var textureIndex = points[i + 8];
                if (textureIndex >= 0) {
                    renderer.context.drawImage(this.textures[textureIndex].baseTexture.source, x1, y1, w, h, x2, y2, w, h);
                }
                else {
                    renderer.context.globalAlpha = 0.5;
                    renderer.context.fillRect(x2, y2, w, h);
                    renderer.context.globalAlpha = 1;
                }
            }
        };
        RectTileLayer.prototype.renderWebGL = function (renderer) {
            var gl = renderer.gl;
            var plugin = renderer.plugins.simpleTilemap;
            var shader = plugin.getShader();
            renderer.setObjectRenderer(plugin);
            renderer.bindShader(shader);
            this._globalMat = this._globalMat || new PIXI.Matrix();
            renderer._activeRenderTarget.projectionMatrix.copy(this._globalMat).append(this.worldTransform);
            shader.uniforms.projectionMatrix = this._globalMat.toArray(true);
            shader.uniforms.shadowColor = this.shadowColor;
            var af = shader.uniforms.animationFrame = plugin.tileAnim;
            this.renderWebGLCore(renderer, plugin);
        };
        RectTileLayer.prototype.renderWebGLCore = function (renderer, plugin) {
            var points = this.pointsBuf;
            if (points.length === 0)
                return;
            var rectsCount = points.length / 9;
            var tile = plugin || renderer.plugins.simpleTilemap;
            var gl = renderer.gl;
            var shader = tile.getShader();
            var textures = this.textures;
            if (textures.length === 0)
                return;
            tile.bindTextures(renderer, shader, textures);
            var vb = tile.getVb(this.vbId);
            if (!vb) {
                vb = tile.createVb();
                this.vbId = vb.id;
                this.vbBuffer = null;
                this.modificationMarker = 0;
            }
            var vao = vb.vao;
            renderer.bindVao(vao);
            tile.checkIndexBuffer(rectsCount);
            var vertexBuf = vb.vb;
            vertexBuf.bind();
            var vertices = rectsCount * shader.vertPerQuad;
            if (vertices === 0)
                return;
            if (this.modificationMarker !== vertices) {
                this.modificationMarker = vertices;
                var vs = shader.stride * vertices;
                if (!this.vbBuffer || this.vbBuffer.byteLength < vs) {
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
                var sz = 0;
                var textureId = 0;
                var shiftU = this.offsetX;
                var shiftV = this.offsetY;
                var tint = -1;
                for (var i = 0; i < points.length; i += 9) {
                    var eps = 0.5;
                    if (this.compositeParent) {
                        textureId = (points[i + 8] >> 2);
                        shiftU = this.offsetX * (points[i + 8] & 1);
                        shiftV = this.offsetY * ((points[i + 8] >> 1) & 1);
                    }
                    var x = points[i + 2], y = points[i + 3];
                    var w = points[i + 4], h = points[i + 5];
                    var u = points[i] + shiftU, v = points[i + 1] + shiftV;
                    var animX = points[i + 6], animY = points[i + 7];
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
                vertexBuf.upload(arr, 0, true);
            }
            gl.drawElements(gl.TRIANGLES, rectsCount * 6, gl.UNSIGNED_SHORT, 0);
        };
        RectTileLayer.prototype.isModified = function (anim) {
            if (this.modificationMarker !== this.pointsBuf.length ||
                anim && this.hasAnim) {
                return true;
            }
            return false;
        };
        RectTileLayer.prototype.clearModify = function () {
            this.modificationMarker = this.pointsBuf.length;
        };
        return RectTileLayer;
    }(PIXI.Container));
    pixi_tilemap.RectTileLayer = RectTileLayer;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var rectShaderFrag = "\nvarying vec2 vTextureCoord;\nvarying vec4 vFrame;\nvarying float vTextureId;\nuniform vec4 shadowColor;\nuniform sampler2D uSamplers[%count%];\nuniform vec2 uSamplerSize[%count%];\n\nvoid main(void){\n   vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);\n   float textureId = floor(vTextureId + 0.5);\n\n   vec4 color;\n   %forloop%\n   gl_FragColor = color;\n}\n";
    var rectShaderVert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aFrame;\nattribute vec2 aAnim;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\nuniform vec2 animationFrame;\n\nvarying vec2 vTextureCoord;\nvarying float vTextureId;\nvarying vec4 vFrame;\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vec2 anim = aAnim * animationFrame;\n   vTextureCoord = aTextureCoord + anim;\n   vFrame = aFrame + vec4(anim, anim);\n   vTextureId = aTextureId;\n}\n";
    var TilemapShader = (function (_super) {
        __extends(TilemapShader, _super);
        function TilemapShader(gl, maxTextures, shaderVert, shaderFrag) {
            var _this = _super.call(this, gl, shaderVert, shaderFrag) || this;
            _this.maxTextures = 0;
            _this.maxTextures = maxTextures;
            pixi_tilemap.shaderGenerator.fillSamplers(_this, _this.maxTextures);
            return _this;
        }
        return TilemapShader;
    }(PIXI.Shader));
    pixi_tilemap.TilemapShader = TilemapShader;
    var RectTileShader = (function (_super) {
        __extends(RectTileShader, _super);
        function RectTileShader(gl, maxTextures) {
            var _this = _super.call(this, gl, maxTextures, rectShaderVert, pixi_tilemap.shaderGenerator.generateFragmentSrc(maxTextures, rectShaderFrag)) || this;
            _this.vertSize = 11;
            _this.vertPerQuad = 4;
            _this.stride = _this.vertSize * 4;
            pixi_tilemap.shaderGenerator.fillSamplers(_this, _this.maxTextures);
            return _this;
        }
        RectTileShader.prototype.createVao = function (renderer, vb) {
            var gl = renderer.gl;
            return renderer.createVao()
                .addIndex(this.indexBuffer)
                .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
                .addAttribute(vb, this.attributes.aTextureCoord, gl.FLOAT, false, this.stride, 2 * 4)
                .addAttribute(vb, this.attributes.aFrame, gl.FLOAT, false, this.stride, 4 * 4)
                .addAttribute(vb, this.attributes.aAnim, gl.FLOAT, false, this.stride, 8 * 4)
                .addAttribute(vb, this.attributes.aTextureId, gl.FLOAT, false, this.stride, 10 * 4);
        };
        return RectTileShader;
    }(TilemapShader));
    pixi_tilemap.RectTileShader = RectTileShader;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var glCore = PIXI.glCore;
    function _hackSubImage(tex, sprite, clearBuffer, clearWidth, clearHeight) {
        var gl = tex.gl;
        var baseTex = sprite.texture.baseTexture;
        if (clearBuffer && clearWidth > 0 && clearHeight > 0) {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, sprite.position.x, sprite.position.y, clearWidth, clearHeight, tex.format, tex.type, clearBuffer);
        }
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, sprite.position.x, sprite.position.y, tex.format, tex.type, baseTex.source);
    }
    var TileRenderer = (function (_super) {
        __extends(TileRenderer, _super);
        function TileRenderer(renderer) {
            var _this = _super.call(this, renderer) || this;
            _this.vbs = {};
            _this.indices = new Uint16Array(0);
            _this.lastTimeCheck = 0;
            _this.tileAnim = [0, 0];
            _this.texLoc = [];
            return _this;
        }
        TileRenderer.prototype.onContextChange = function () {
            var gl = this.renderer.gl;
            var maxTextures = pixi_tilemap.Constant.maxTextures;
            this.rectShader = new pixi_tilemap.RectTileShader(gl, maxTextures);
            this.checkIndexBuffer(2000);
            this.rectShader.indexBuffer = this.indexBuffer;
            this.vbs = {};
            this.glTextures = [];
            this.boundSprites = [];
            this.initBounds();
        };
        TileRenderer.prototype.initBounds = function () {
            var gl = this.renderer.gl;
            var maxTextures = pixi_tilemap.Constant.maxTextures;
            for (var i = 0; i < maxTextures; i++) {
                var rt = PIXI.RenderTexture.create(pixi_tilemap.Constant.bufferSize, pixi_tilemap.Constant.bufferSize);
                rt.baseTexture.premultipliedAlpha = true;
                rt.baseTexture.scaleMode = TileRenderer.SCALE_MODE;
                rt.baseTexture.wrapMode = PIXI.WRAP_MODES.CLAMP;
                this.renderer.textureManager.updateTexture(rt);
                this.glTextures.push(rt);
                var bounds = this.boundSprites;
                for (var j = 0; j < pixi_tilemap.Constant.boundCountPerBuffer; j++) {
                    var spr = new PIXI.Sprite();
                    spr.position.x = pixi_tilemap.Constant.boundSize * (j & 1);
                    spr.position.y = pixi_tilemap.Constant.boundSize * (j >> 1);
                    bounds.push(spr);
                }
            }
        };
        TileRenderer.prototype.bindTextures = function (renderer, shader, textures) {
            var len = textures.length;
            var maxTextures = pixi_tilemap.Constant.maxTextures;
            if (len > pixi_tilemap.Constant.boundCountPerBuffer * maxTextures) {
                return;
            }
            var doClear = TileRenderer.DO_CLEAR;
            if (doClear && !this._clearBuffer) {
                this._clearBuffer = new Uint8Array(pixi_tilemap.Constant.boundSize * pixi_tilemap.Constant.boundSize * 4);
            }
            var glts = this.glTextures;
            var bounds = this.boundSprites;
            var oldActiveRenderTarget = this.renderer._activeRenderTarget;
            var i;
            for (i = 0; i < len; i++) {
                var texture = textures[i];
                if (!texture || !texture.valid)
                    continue;
                var bs = bounds[i];
                if (!bs.texture ||
                    bs.texture.baseTexture !== texture.baseTexture) {
                    bs.texture = texture;
                    var glt = glts[i >> 2];
                    renderer.bindTexture(glt, 0, true);
                    if (doClear) {
                        _hackSubImage(glt.baseTexture._glTextures[renderer.CONTEXT_UID], bs, this._clearBuffer, pixi_tilemap.Constant.boundSize, pixi_tilemap.Constant.boundSize);
                    }
                    else {
                        _hackSubImage(glt.baseTexture._glTextures[renderer.CONTEXT_UID], bs);
                    }
                }
            }
            if (!oldActiveRenderTarget.root) {
                this.renderer._activeRenderTarget.frameBuffer.bind();
            }
            this.texLoc.length = 0;
            var gltsUsed = (i + 3) >> 2;
            for (i = 0; i < gltsUsed; i++) {
                this.texLoc.push(renderer.bindTexture(glts[i], i, true));
            }
            shader.uniforms.uSamplers = this.texLoc;
        };
        TileRenderer.prototype.checkLeaks = function () {
            var now = Date.now();
            var old = now - 10000;
            if (this.lastTimeCheck < old ||
                this.lastTimeCheck > now) {
                this.lastTimeCheck = now;
                var vbs = this.vbs;
                for (var key in vbs) {
                    if (vbs[key].lastTimeAccess < old) {
                        this.removeVb(key);
                    }
                }
            }
        };
        TileRenderer.prototype.start = function () {
            this.renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
        };
        TileRenderer.prototype.getVb = function (id) {
            this.checkLeaks();
            var vb = this.vbs[id];
            if (vb) {
                vb.lastAccessTime = Date.now();
                return vb;
            }
            return null;
        };
        TileRenderer.prototype.createVb = function () {
            var id = ++TileRenderer.vbAutoincrement;
            var shader = this.getShader();
            var gl = this.renderer.gl;
            this.renderer.bindVao(null);
            var vb = PIXI.glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
            var stuff = {
                id: id,
                vb: vb,
                vao: shader.createVao(this.renderer, vb),
                lastTimeAccess: Date.now(),
                shader: shader
            };
            this.vbs[id] = stuff;
            return stuff;
        };
        TileRenderer.prototype.removeVb = function (id) {
            if (this.vbs[id]) {
                this.vbs[id].vb.destroy();
                this.vbs[id].vao.destroy();
                delete this.vbs[id];
            }
        };
        TileRenderer.prototype.checkIndexBuffer = function (size) {
            var totalIndices = size * 6;
            var indices = this.indices;
            if (totalIndices <= indices.length) {
                return;
            }
            var len = indices.length || totalIndices;
            while (len < totalIndices) {
                len <<= 1;
            }
            indices = new Uint16Array(len);
            this.indices = indices;
            for (var i = 0, j = 0; i + 5 < indices.length; i += 6, j += 4) {
                indices[i + 0] = j + 0;
                indices[i + 1] = j + 1;
                indices[i + 2] = j + 2;
                indices[i + 3] = j + 0;
                indices[i + 4] = j + 2;
                indices[i + 5] = j + 3;
            }
            if (this.indexBuffer) {
                this.indexBuffer.upload(indices);
            }
            else {
                var gl = this.renderer.gl;
                this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);
            }
        };
        TileRenderer.prototype.getShader = function () {
            return this.rectShader;
        };
        TileRenderer.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.rectShader.destroy();
            this.rectShader = null;
        };
        TileRenderer.vbAutoincrement = 0;
        TileRenderer.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
        TileRenderer.DO_CLEAR = false;
        return TileRenderer;
    }(PIXI.ObjectRenderer));
    pixi_tilemap.TileRenderer = TileRenderer;
    PIXI.WebGLRenderer.registerPlugin('tilemap', TileRenderer);
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var SimpleTileRenderer = (function (_super) {
        __extends(SimpleTileRenderer, _super);
        function SimpleTileRenderer(renderer) {
            var _this = _super.call(this, renderer) || this;
            _this.samplerSize = [];
            return _this;
        }
        SimpleTileRenderer.prototype.onContextChange = function () {
            var gl = this.renderer.gl;
            this.rectShader = new pixi_tilemap.RectTileShader(gl, 1);
            this.checkIndexBuffer(2000);
            this.rectShader.indexBuffer = this.indexBuffer;
            this.vbs = {};
        };
        SimpleTileRenderer.prototype.bindTextures = function (renderer, shader, textures) {
            var len = textures.length;
            var i;
            for (i = 0; i < len; i++) {
                var texture = textures[i];
                if (!texture || !texture.valid) {
                    continue;
                }
                this.texLoc[0] = renderer.bindTexture(texture, 0, true);
                shader.uniforms.uSamplers = this.texLoc;
                this.samplerSize[0] = 1.0 / texture.baseTexture.width;
                this.samplerSize[1] = 1.0 / texture.baseTexture.height;
                shader.uniforms.uSamplerSize = this.samplerSize;
                break;
            }
        };
        SimpleTileRenderer.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return SimpleTileRenderer;
    }(pixi_tilemap.TileRenderer));
    pixi_tilemap.SimpleTileRenderer = SimpleTileRenderer;
    PIXI.WebGLRenderer.registerPlugin('simpleTilemap', SimpleTileRenderer);
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var ZLayer = (function (_super) {
        __extends(ZLayer, _super);
        function ZLayer(tilemap, zIndex) {
            var _this = _super.call(this) || this;
            _this._lastAnimationFrame = -1;
            _this.tilemap = tilemap;
            _this.z = zIndex;
            return _this;
        }
        ZLayer.prototype.clear = function () {
            var layers = this.children;
            for (var i = 0; i < layers.length; i++)
                layers[i].clear();
            this._previousLayers = 0;
        };
        ZLayer.prototype.cacheIfDirty = function () {
            var tilemap = this.tilemap;
            var layers = this.children;
            var modified = this._previousLayers !== layers.length;
            this._previousLayers = layers.length;
            var buf = this.canvasBuffer;
            var tempRender = this._tempRender;
            if (!buf) {
                buf = this.canvasBuffer = document.createElement('canvas');
                tempRender = this._tempRender = new PIXI.CanvasRenderer(100, 100, { view: buf });
                tempRender.context = tempRender.rootContext;
                tempRender.plugins.tilemap.dontUseTransform = true;
            }
            if (buf.width !== tilemap._layerWidth ||
                buf.height !== tilemap._layerHeight) {
                buf.width = tilemap._layerWidth;
                buf.height = tilemap._layerHeight;
                modified = true;
            }
            var i;
            if (!modified) {
                for (i = 0; i < layers.length; i++) {
                    if (layers[i].isModified(this._lastAnimationFrame !== tilemap.animationFrame)) {
                        modified = true;
                        break;
                    }
                }
            }
            this._lastAnimationFrame = tilemap.animationFrame;
            if (modified) {
                if (tilemap._hackRenderer) {
                    tilemap._hackRenderer(tempRender);
                }
                tempRender.context.clearRect(0, 0, buf.width, buf.height);
                for (i = 0; i < layers.length; i++) {
                    layers[i].clearModify();
                    layers[i].renderCanvas(tempRender);
                }
            }
            this.layerTransform = this.worldTransform;
            for (i = 0; i < layers.length; i++) {
                this.layerTransform = layers[i].worldTransform;
                break;
            }
        };
        ZLayer.prototype.renderCanvas = function (renderer) {
            this.cacheIfDirty();
            var wt = this.layerTransform;
            renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderer.resolution, wt.ty * renderer.resolution);
            var tilemap = this.tilemap;
            renderer.context.drawImage(this.canvasBuffer, 0, 0);
        };
        return ZLayer;
    }(PIXI.Container));
    pixi_tilemap.ZLayer = ZLayer;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    PIXI.tilemap = pixi_tilemap;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var shaderGenerator;
    (function (shaderGenerator) {
        function fillSamplers(shader, maxTextures) {
            var sampleValues = [];
            for (var i = 0; i < maxTextures; i++) {
                sampleValues[i] = i;
            }
            shader.bind();
            shader.uniforms.uSamplers = sampleValues;
            var samplerSize = [];
            for (i = 0; i < maxTextures; i++) {
                samplerSize.push(1.0 / pixi_tilemap.Constant.bufferSize);
                samplerSize.push(1.0 / pixi_tilemap.Constant.bufferSize);
            }
            shader.uniforms.uSamplerSize = samplerSize;
        }
        shaderGenerator.fillSamplers = fillSamplers;
        function generateFragmentSrc(maxTextures, fragmentSrc) {
            return fragmentSrc.replace(/%count%/gi, maxTextures + "")
                .replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));
        }
        shaderGenerator.generateFragmentSrc = generateFragmentSrc;
        function generateSampleSrc(maxTextures) {
            var src = '';
            src += '\n';
            src += '\n';
            src += 'if(vTextureId <= -1.0) {';
            src += '\n\tcolor = shadowColor;';
            src += '\n}';
            for (var i = 0; i < maxTextures; i++) {
                src += '\nelse ';
                if (i < maxTextures - 1) {
                    src += 'if(textureId == ' + i + '.0)';
                }
                src += '\n{';
                src += '\n\tcolor = texture2D(uSamplers[' + i + '], textureCoord * uSamplerSize[' + i + ']);';
                src += '\n}';
            }
            src += '\n';
            src += '\n';
            return src;
        }
        shaderGenerator.generateSampleSrc = generateSampleSrc;
    })(shaderGenerator = pixi_tilemap.shaderGenerator || (pixi_tilemap.shaderGenerator = {}));
})(pixi_tilemap || (pixi_tilemap = {}));
//# sourceMappingURL=pixi-tilemap.js.map