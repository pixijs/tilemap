(function() {
    //TODO: multi-texturing!!!
    //TODO: make it look like v4 SpriteRenderer
    //TODO: add index for rectsz

    function SquareTileShader(gl) {
        PIXI.Shader.call(this, gl,
            [
                'attribute vec4 aVertexPosition;',
                'attribute vec3 aSize;',

                'uniform mat3 projectionMatrix;',
                'uniform vec2 samplerSize;',
                'uniform vec2 animationFrame;',
                'uniform float projectionScale;',

                'varying vec2 vTextureCoord;',
                'varying float vSize;',

                'void main(void){',
                '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition.xy + aSize.x * 0.5, 1.0)).xy, 0.0, 1.0);',
                '   gl_PointSize = aSize.x * projectionScale;',
                '   vTextureCoord = (aVertexPosition.zw + aSize.yz * animationFrame ) * samplerSize;',
                '   vSize = aSize.x;',
                '}'
            ].join("\n"),
            [
                'varying vec2 vTextureCoord;',
                'varying float vSize;',
                'uniform vec2 samplerSize;',

                'uniform sampler2D uSampler;',
                'uniform vec2 pointScale;',

                'void main(void){',
                '   float margin = 1.0/vSize;',
                '   vec2 clamped = vec2(clamp(gl_PointCoord.x, margin, 1.0 - margin), clamp(gl_PointCoord.y, margin, 1.0 - margin));',
                '   gl_FragColor = texture2D(uSampler, ((clamped-0.5) * pointScale + 0.5) * vSize * samplerSize + vTextureCoord);',
                '}'
            ].join('\n')
        );
        this.vertSize = 7;
        this.vertPerQuad = 1;
        this.stride = this.vertSize * 4;
    }

    SquareTileShader.prototype = Object.create(PIXI.Shader.prototype);
    SquareTileShader.prototype.constructor = SquareTileShader;
    SquareTileShader.prototype.createVao = function (renderer, vb) {
        var gl = renderer.gl;
        return renderer.createVao()
            .addIndex(this.indexBuffer)
            .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
            .addAttribute(vb, this.attributes.aSize, gl.FLOAT, false, this.stride, 4 * 4);
    };


    function RectTileShader(gl)
    {
        PIXI.Shader.call(this, gl,
            [
                'precision lowp float;',
                'attribute vec4 aVertexPosition;',
                'attribute vec2 aAnim;',

                'uniform mat3 projectionMatrix;',
                'uniform vec2 samplerSize;',
                'uniform vec2 animationFrame;',

                'varying vec2 vTextureCoord;',

                'void main(void){',
                '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition.xy, 1.0)).xy, 0.0, 1.0);',
                '   vTextureCoord = (aVertexPosition.zw + aAnim * animationFrame ) * samplerSize;',
                '}'
            ].join('\n'),
            [
                'precision lowp float;',
                'varying vec2 vTextureCoord;',
                'uniform sampler2D uSampler;',
                'void main(void){',
                '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
                '}'
            ].join('\n')
        );
        this.vertSize = 6;
        this.vertPerQuad = 6;
        this.stride = this.vertSize * 4;
    }

    RectTileShader.prototype = Object.create(PIXI.Shader.prototype);
    RectTileShader.prototype.constructor = RectTileShader;
    RectTileShader.prototype.createVao = function (renderer, vb) {
        var gl = renderer.gl;
        return renderer.createVao()
            .addIndex(this.indexBuffer)
            .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
            .addAttribute(vb, this.attributes.aAnim, gl.FLOAT, false, this.stride, 4 * 4);
    };


    function CanvasTileRenderer(renderer) {
        this.renderer = renderer;
        this.tileAnim = [0, 0];
    }

    PIXI.CanvasRenderer.registerPlugin('tile', CanvasTileRenderer);

    /**
     * The default vertex shader source
     *
     * @static
     * @constant
     */

    function TileRenderer(renderer) {
        PIXI.ObjectRenderer.call(this, renderer);
        this.vbs = {};
        this.lastTimeCheck = 0;
        this.tileAnim = [0, 0];
        this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    }

    TileRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
    TileRenderer.prototype.constructor = TileRenderer;
    TileRenderer.vbAutoincrement = 0;

    TileRenderer.prototype.onContextChange = function() {
        var gl = this.renderer.gl;
        this.rectShader = new RectTileShader(gl);
        this.squareShader = new SquareTileShader(gl);
        this.indexBuffer = PIXI.glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);
        this.rectShader.indexBuffer = this.indexBuffer;
        this.squareShader.indexBuffer = this.indexBuffer;
        this.vbs = {};
    };


    TileRenderer.prototype.checkLeaks = function() {
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

    TileRenderer.prototype.start = function() {
        this.renderer.state.setBlendMode( PIXI.BLEND_MODES.NORMAL );
        //sorry, nothing
    };

    TileRenderer.prototype.getVb = function(id) {
        this.checkLeaks();
        var vb = this.vbs[id];
        if (vb) {
            vb.lastAccessTime = Date.now();
            return vb;
        }
        return null;
    };

    TileRenderer.prototype.createVb = function(useSquare) {
        var id = ++TileRenderer.vbAutoincrement;
        var shader = this.getShader(useSquare);
        var gl = this.renderer.gl;
        var vb = PIXI.glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
        return this.vbs[id] = {
            id: id,
            vb: vb,
            vao: shader.createVao(this.renderer, vb),
            lastTimeAccess: Date.now(),
            useSquare: useSquare,
            shader: shader
        };
    };

    TileRenderer.prototype.removeVb = function(id) {
        if (this.vbs[id]) {
            this.vbs[id].vb.destroy();
            this.vbs[id].vao.destroy();
            delete this.vbs[id];
        }
    };

    TileRenderer.prototype.getShader = function(useSquare) {
        return useSquare ? this.squareShader : this.rectShader;
    };

    TileRenderer.prototype.destroy = function () {
        PIXI.ObjectRenderer.prototype.destroy.call(this);
        this.rectShader.destroy();
        this.squareShader.destroy();
        this.rectShader = null;
        this.squareShader = null;
    };

    PIXI.WebGLRenderer.registerPlugin('tile', TileRenderer);

    function RectTileLayer(zIndex, texture) {
        PIXI.DisplayObject.apply(this, arguments);
        this.initialize.apply(this, arguments);
    }

    RectTileLayer.prototype = Object.create(PIXI.DisplayObject.prototype);
    RectTileLayer.prototype.constructor = RectTileLayer;

    RectTileLayer.prototype.initialize = function(zIndex, texture) {
        this.texture = texture;
        this.z = this.zIndex = zIndex;
        this.pointsBuf = [];
        this.visible = false;
    };

    RectTileLayer.prototype.clear = function () {
        this.pointsBuf.length = 0;
        this.modificationMarker = 0;
        this.hasAnim = false;
    };

    RectTileLayer.prototype.renderCanvas = function (renderer) {
        if (!this.texture || !this.texture.valid) return;
        var points = this.pointsBuf;
        for (var i = 0, n = points.length; i < n; i += 8) {
            var x1 = points[i], y1 = points[i+1];
            var x2 = points[i+2], y2 = points[i+3];
            var w = points[i+4];
            var h = points[i+5];
            x1 += points[i+6] * renderer.plugins.tile.tileAnim[0];
            y1 += points[i+7] * renderer.plugins.tile.tileAnim[1];
            renderer.context.drawImage(this.texture.baseTexture.source, x1, y1, w, h, x2, y2, w, h);
        }
    };

    RectTileLayer.prototype.addRect = function (u, v, x, y, tileWidth, tileHeight, animX, animY) {
        var pb = this.pointsBuf;
        this.hasAnim = this.hasAnim || animX > 0 || animY > 0;
        if (tileWidth == tileHeight) {
            pb.push(u);
            pb.push(v);
            pb.push(x);
            pb.push(y);
            pb.push(tileWidth);
            pb.push(tileHeight);
            pb.push(animX | 0);
            pb.push(animY | 0);
        } else {
            //horizontal line on squares
            if (tileWidth % tileHeight == 0) {
                for (var i=0;i<tileWidth/tileHeight;i++) {
                    pb.push(u + i * tileHeight);
                    pb.push(v);
                    pb.push(x + i * tileHeight);
                    pb.push(y);
                    pb.push(tileHeight);
                    pb.push(tileHeight);
                    pb.push(animX | 0);
                    pb.push(animY | 0);
                }
            } else {
                //ok, ok, lets use rectangle. but its not working with square shader yet
                pb.push(u);
                pb.push(v);
                pb.push(x);
                pb.push(y);
                pb.push(tileWidth);
                pb.push(tileHeight);
                pb.push(animX | 0);
                pb.push(animY | 0);
            }
        }
    };

    RectTileLayer.prototype.renderWebGL = function(renderer, useSquare) {
        if (!this.texture || !this.texture.valid) return;
        var points = this.pointsBuf;
        if (points.length == 0) return;

        var tile = renderer.plugins.tile;
        var gl = renderer.gl;
        var shader = tile.getShader(useSquare);
        var texture = this.texture.baseTexture;
        renderer.bindTexture(texture, 0);
        var tempSize = this._tempSize = (this._tempSize || [0, 0]);
        tempSize[0] = 1.0 / texture.width;
        tempSize[1] = 1.0 / texture.height;
        shader.uniforms.samplerSize = tempSize;
        //lost context! recover!
        var vb = tile.getVb(this.vbId);
        if (!vb) {
            vb = tile.createVb(useSquare);
            this.vbId = vb.id;
            this.vbBuffer = null;
            this.modificationMarker = 0;
        }
        var vao = vb.vao.bind();
        vb = vb.vb;
        //if layer was changed, re-upload vertices
        vb.bind();
        var vertices = points.length / 8 * shader.vertPerQuad;
        if (this.modificationMarker != vertices) {
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
                vb.upload(this.vbBuffer, 0, true);
            }

            var arr = this.vbArray, ints = this.vbInts;
            //upload vertices!
            var sz = 0;
            //var tint = 0xffffffff;
            if (useSquare) {
                for (var i = 0; i < points.length; i += 8) {
                    arr[sz++] = points[i + 2];
                    arr[sz++] = points[i + 3];
                    arr[sz++] = points[i + 0];
                    arr[sz++] = points[i + 1];
                    arr[sz++] = points[i + 4];
                    arr[sz++] = points[i + 6];
                    arr[sz++] = points[i + 7];
                }
            } else {
                var ww = texture.width, hh = texture.height;
                //var tint = 0xffffffff;
                var tint = -1;
                for (var i=0;i<points.length;i+=8) {
                    var x = points[i+2], y = points[i+3];
                    var w = points[i+4], h = points[i+5];
                    var u = points[i], v = points[i+1];
                    var animX = points[i+6], animY = points[i+7];
                    arr[sz++] = x;
                    arr[sz++] = y;
                    arr[sz++] = u;
                    arr[sz++] = v;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = x + w;
                    arr[sz++] = y;
                    arr[sz++] = u + w;
                    arr[sz++] = v;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = x + w;
                    arr[sz++] = y + h;
                    arr[sz++] = u + w;
                    arr[sz++] = v + h;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = x;
                    arr[sz++] = y;
                    arr[sz++] = u;
                    arr[sz++] = v;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = x + w;
                    arr[sz++] = y + h;
                    arr[sz++] = u + w;
                    arr[sz++] = v + h;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                    arr[sz++] = x;
                    arr[sz++] = y + h;
                    arr[sz++] = u;
                    arr[sz++] = v + h;
                    arr[sz++] = animX;
                    arr[sz++] = animY;
                }
            }
            // if (vs > this.vbArray.length/2 ) {
            vb.upload(arr, 0, true);
            // } else {
            //     var view = arr.subarray(0, vs);
            //     vb.upload(view, 0);
            // }
        }
        if (useSquare)
            gl.drawArrays(gl.POINTS, 0, vertices);
        else
            gl.drawArrays(gl.TRIANGLES, 0, vertices);
    }

    function CompositeRectTileLayer() {
        PIXI.Container.apply(this, arguments);
        this.initialize.apply(this, arguments);
    }

    CompositeRectTileLayer.prototype = Object.create(PIXI.Container.prototype);
    CompositeRectTileLayer.prototype.constructor = RectTileLayer;
    CompositeRectTileLayer.prototype.updateTransform = CompositeRectTileLayer.prototype.displayObjectUpdateTransform;

        //can be initialized multiple times
    CompositeRectTileLayer.prototype.initialize = function(zIndex, bitmaps, useSquare) {
        this.z = this.zIndex = zIndex;
        this.useSquare = useSquare;
        bitmaps && this.setBitmaps(bitmaps);
    };

    CompositeRectTileLayer.prototype.setBitmaps = function(bitmaps) {
        this.removeChildren();
        for (var i=0;i<bitmaps.length;i++)
            this.addChild(new RectTileLayer(this.zIndex, bitmaps[i]));
        this.modificationMarker = 0;
    };

    CompositeRectTileLayer.prototype.clear = function () {
        for (var i=0;i<this.children.length;i++)
            this.children[i].clear();
        this.modificationMarker = 0;
    };

    CompositeRectTileLayer.prototype.addRect = function (num, u, v, x, y, tileWidth, tileHeight) {
        if (this.children[num] && this.children[num].texture)
            this.children[num].addRect(u, v, x, y, tileWidth, tileHeight);
    };

    /**
     * "hello world!" of pixi-tilemap library. Pass it texture and it will be added
     * @param texture
     * @param x
     * @param y
     * @returns {boolean}
     */
    CompositeRectTileLayer.prototype.addFrame = function (texture, x, y) {
        if (typeof texture === "string") {
            texture = PIXI.Texture.fromImage(texture);
        }
        var children = this.children;
        var layer = null;
        for (var i=0;i<children.length; i++) {
            if (children[i].texture.baseTexture == texture.baseTexture) {
                layer = children[i];
                break;
            }
        }
        if (!layer) {
            children.push(layer = new RectTileLayer(this.zIndex, texture));
        }
        layer.addRect(texture.frame.x, texture.frame.y, x, y, texture.frame.width, texture.frame.height);
        return true;
    };

    CompositeRectTileLayer.prototype.renderCanvas = function (renderer) {
        if (!renderer.dontUseTransform) {
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


    CompositeRectTileLayer.prototype.renderWebGL = function(renderer) {
        var gl = renderer.gl;
        var shader = renderer.plugins.tile.getShader(this.useSquare);
        renderer.setObjectRenderer(renderer.plugins.tile);
        renderer.bindShader(shader);
        //TODO: dont create new array, please
        this._globalMat = this._globalMat || new PIXI.Matrix();
        renderer._activeRenderTarget.projectionMatrix.copy(this._globalMat).append(this.worldTransform);
        shader.uniforms.projectionMatrix = this._globalMat.toArray(true);
        if (this.useSquare) {
            var tempScale = this._tempScale = (this._tempScale || [0, 0]);
            tempScale[0] = this._globalMat.a >= 0?1:-1;
            tempScale[1] = this._globalMat.d < 0?1:-1;
            var ps = shader.uniforms.pointScale = tempScale;
            shader.uniforms.projectionScale = Math.abs(this.worldTransform.a);
        }
        var af = shader.uniforms.animationFrame = renderer.plugins.tile.tileAnim;
        //shader.syncUniform(shader.uniforms.animationFrame);
        var layers = this.children;
        for (var i = 0; i < layers.length; i++)
            layers[i].renderWebGL(renderer, this.useSquare);
    };


    CompositeRectTileLayer.prototype.isModified = function(anim) {
        var layers = this.children;
        if (this.modificationMarker != layers.length) {
            return true;
        }
        for (var i=0;i<layers.length;i++) {
            if (layers[i].modificationMarker != layers[i].pointsBuf.length ||
                anim && layers[i].hasAnim) {
                return true;
            }
        }
        return false;
    };

    CompositeRectTileLayer.prototype.clearModify = function() {
        var layers = this.children;
        this.modificationMarker = layers.length;
        for (var i = 0; i < layers.length; i++) {
            layers[i].modificationMarker = layers[i].pointsBuf.length;
        }
    };

    function GraphicsLayer(zIndex) {
        PIXI.Graphics.apply(this, arguments);
        this.z = this.zIndex = zIndex;
    }

    GraphicsLayer.prototype = Object.create(PIXI.Graphics.prototype);
    GraphicsLayer.prototype.constructor = GraphicsLayer;
    GraphicsLayer.prototype.renderCanvas = function (renderer) {
        var wt = null;
        if (renderer.dontUseTransform) {
            wt = this.transform.worldTransform;
            this.transform.worldTransform = PIXI.Matrix.IDENTITY;
        }
        renderer.plugins.graphics.render(this);
        if (renderer.dontUseTransform) {
            this.transform.worldTransform = wt;
        }
        renderer.context.globalAlpha = 1.0;
    };
    GraphicsLayer.prototype.renderWebGL = function(renderer) {
        if (!this._webGL[renderer.gl.id])
            this.dirty = true;
        PIXI.Graphics.prototype.renderWebGL.call(this, renderer);
    };

    GraphicsLayer.prototype.isModified = function(anim) {
        return false;
    };

    GraphicsLayer.prototype.clearModify = function() {
    };

    function ZLayer() {
        this.initialize.apply(this, arguments);
    };

    ZLayer.prototype = Object.create(PIXI.Container.prototype);
    ZLayer.prototype.initialize = function(tilemap, zIndex) {
        PIXI.Container.apply(this, arguments);
        this.tilemap = tilemap;
        this.z = zIndex;
    };

    ZLayer.prototype.clear = function() {
        var layers = this.children;
        for (var i=0; i<layers.length; i++)
            layers[i].clear();
        this._previousLayers = 0;
    };

    ZLayer.prototype.cacheIfDirty = function() {
        var tilemap = this.tilemap;
        var layers = this.children;
        var modified = this._previousLayers != layers.length;
        this._previousLayers = layers.length;
        var buf = this.canvasBuffer;
        var tempRender = this._tempRender;
        if (!buf) {
            buf = this.canvasBuffer = document.createElement('canvas');
            tempRender = this._tempRender = new PIXI.CanvasRenderer(100, 100, { view: buf });
            tempRender.context = tempRender.rootContext;
            tempRender.dontUseTransform = true;
        }
        if (buf.width != tilemap._layerWidth ||
            buf.height != tilemap._layerHeight) {
            buf.width = tilemap._layerWidth;
            buf.height = tilemap._layerHeight;
            modified = true;
        }
        if (!modified) {
            for (var i=0;i<layers.length;i++) {
                if (layers[i].isModified(this._lastAnimationFrame != tilemap.animationFrame)) {
                    modified = true;
                    break;
                }
            }
        }
        this._lastAnimationFrame = tilemap.animationFrame;
        if (modified) {
            tilemap._hackRenderer && tilemap._hackRenderer(tempRender);
            tempRender.context.clearRect(0, 0, buf.width, buf.height);
            for (var i=0;i<layers.length;i++) {
                layers[i].clearModify();
                layers[i].renderCanvas(tempRender);
            }
        }
        this.layerTransform = this.worldTransform;
        for (var i=0;i<layers.length;i++) {
            this.layerTransform = layers[i].worldTransform;
            break;
        }
    };

    ZLayer.prototype.renderCanvas = function(renderer) {
        this.cacheIfDirty();
        var wt = this.layerTransform;
        renderer.context.setTransform(
            wt.a,
            wt.b,
            wt.c,
            wt.d,
            wt.tx * renderer.resolution,
            wt.ty * renderer.resolution
        );
        var tilemap = this.tilemap;
        renderer.context.drawImage(this.canvasBuffer, 0, 0);
    };

    PIXI.tilemap = {
        ZLayer: ZLayer,
        GraphicsLayer: GraphicsLayer,
        RectTileLayer: RectTileLayer,
        CompositeRectTileLayer: CompositeRectTileLayer
    };
})();