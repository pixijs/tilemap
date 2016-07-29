(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function CanvasTileRenderer(renderer) {
    this.renderer = renderer;
    this.tileAnim = [0, 0];
}

PIXI.CanvasRenderer.registerPlugin('tile', CanvasTileRenderer);

module.exports = CanvasTileRenderer;

},{}],2:[function(require,module,exports){
var RectTileLayer = require('./RectTileLayer');

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
    this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
    if (bitmaps) {
        this.setBitmaps(bitmaps);
    }
};

CompositeRectTileLayer.prototype.setBitmaps = function(bitmaps) {
    this.removeChildren();
    this.addChild(new RectTileLayer(this.zIndex, bitmaps));
    this.modificationMarker = 0;
};

CompositeRectTileLayer.prototype.clear = function () {
    for (var i=0;i<this.children.length;i++)
        this.children[i].clear();
    this.modificationMarker = 0;
};

CompositeRectTileLayer.prototype.addRect = function (num, u, v, x, y, tileWidth, tileHeight) {
    if (this.children[num] && this.children[num].textures)
        this.children[num].addRect(0, u, v, x, y, tileWidth, tileHeight);
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
    var layer = null, ind = 0;
    for (var i=0;i<children.length; i++) {
        var tex = children[i].textures;
        for (var j=0;j < tex.length;j++) {
            if (tex[j].baseTexture == texture.baseTexture) {
                layer = children[i];
                ind = j;
                break;
            }
        }
        if (layer) {
            break;
        }
    }
    if (!layer) {
        for (i=0;i<children.length;i++) {
            var child = children[i];
            if (child.textures.length < 16) {
                layer = child;
                ind = child.textures.length;
                child.textures.push(texture);
            }
        }
        if (!layer) {
            children.push(layer = new RectTileLayer(this.zIndex, texture));
            ind = 0;
        }
    }
    layer.addRect(ind, texture.frame.x, texture.frame.y, x, y, texture.frame.width, texture.frame.height);
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
    shader.uniforms.shadowColor = this.shadowColor;
    if (this.useSquare) {
        var tempScale = this._tempScale = (this._tempScale || [0, 0]);
        tempScale[0] = this._globalMat.a >= 0?1:-1;
        tempScale[1] = this._globalMat.d < 0?1:-1;
        var ps = shader.uniforms.pointScale = tempScale;
        shader.uniforms.projectionScale = Math.abs(this.worldTransform.a) * renderer.resolution;
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

module.exports = CompositeRectTileLayer;

},{"./RectTileLayer":4}],3:[function(require,module,exports){
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

module.exports = GraphicsLayer;

},{}],4:[function(require,module,exports){
function RectTileLayer(zIndex, texture) {
    PIXI.DisplayObject.apply(this, arguments);
    this.initialize.apply(this, arguments);
}

RectTileLayer.prototype = Object.create(PIXI.DisplayObject.prototype);
RectTileLayer.prototype.constructor = RectTileLayer;

RectTileLayer.prototype.initialize = function(zIndex, textures) {
    if (!textures) {
        textures = [];
    } else if (!(textures instanceof Array) && textures.baseTexture) {
        textures = [textures];
    }
    this.textures = textures;
    this.z = this.zIndex = zIndex;
    this.pointsBuf = [];
    this.visible = false;
    this._tempSize = new Float32Array([0, 0]);
    this._tempTexSize = 1;
};

RectTileLayer.prototype.clear = function () {
    this.pointsBuf.length = 0;
    this.modificationMarker = 0;
    this.hasAnim = false;
};

RectTileLayer.prototype.renderCanvas = function (renderer) {
    if (this.textures.length === 0) return;
    var points = this.pointsBuf;
    renderer.context.fillStyle = '#000000';
    for (var i = 0, n = points.length; i < n; i += 9) {
        var x1 = points[i], y1 = points[i+1];
        var x2 = points[i+2], y2 = points[i+3];
        var w = points[i+4];
        var h = points[i+5];
        x1 += points[i+6] * renderer.plugins.tile.tileAnim[0];
        y1 += points[i+7] * renderer.plugins.tile.tileAnim[1];
        var textureId = points[i+8];
        if (textureId >= 0) {
            renderer.context.drawImage(this.textures[textureId].baseTexture.source, x1, y1, w, h, x2, y2, w, h);
        } else {
            renderer.context.globalAlpha = 0.5;
            renderer.context.fillRect(x2, y2, w, h);
            renderer.context.globalAlpha = 1;
        }
    }
};

RectTileLayer.prototype.addRect = function (textureId, u, v, x, y, tileWidth, tileHeight, animX, animY) {
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
        pb.push(textureId);
    } else {
        var i;
        if (tileWidth % tileHeight === 0) {
            //horizontal line on squares
            for (i=0;i<tileWidth/tileHeight;i++) {
                pb.push(u + i * tileHeight);
                pb.push(v);
                pb.push(x + i * tileHeight);
                pb.push(y);
                pb.push(tileHeight);
                pb.push(tileHeight);
                pb.push(animX | 0);
                pb.push(animY | 0);
                pb.push(textureId);
            }
        } else if (tileHeight % tileWidth === 0) {
            //vertical line on squares
            for (i=0;i<tileHeight/tileWidth;i++) {
                pb.push(u);
                pb.push(v + i * tileWidth);
                pb.push(x);
                pb.push(y + i * tileWidth);
                pb.push(tileWidth);
                pb.push(tileWidth);
                pb.push(animX | 0);
                pb.push(animY | 0);
                pb.push(textureId);
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
            pb.push(textureId);
        }
    }
};

RectTileLayer.prototype.renderWebGL = function(renderer, useSquare) {
    var points = this.pointsBuf;
    if (points.length === 0) return;
    var rectsCount = points.length / 9;
    var tile = renderer.plugins.tile;
    var gl = renderer.gl;
    if (!useSquare) {
        tile.checkIndexBuffer(rectsCount);
    }

    var shader = tile.getShader(useSquare);
    var textures = this.textures;
    if (textures.length === 0) return;
    var len = textures.length;
    if (this._tempTexSize < shader.maxTextures) {
        this._tempTexSize = shader.maxTextures;
        this._tempSize = new Float32Array(2*shader.maxTextures);
    }
    // var samplerSize = this._tempSize;
    for (var i=0;i<len;i++) {
        if (!textures[i] || !textures[i].valid) return;
        var texture = textures[i].baseTexture;
        // samplerSize[i * 2] = 1.0 / texture.width;
        // samplerSize[i * 2 + 1] = 1.0 / texture.height;
    }
    tile.bindTextures(renderer, textures);
    // shader.uniforms.uSamplerSize = samplerSize;
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
    var vertices = rectsCount * shader.vertPerQuad;
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
        var textureId, shiftU, shiftV;
        if (useSquare) {
            for (i = 0; i < points.length; i += 9) {
                textureId = (points[i+8] >> 2);
                shiftU = 1024 * (points[i+8] & 1);
                shiftV = 1024 * ((points[i+8] >> 1) & 1);
                arr[sz++] = points[i + 2];
                arr[sz++] = points[i + 3];
                arr[sz++] = points[i + 0] + shiftU;
                arr[sz++] = points[i + 1] + shiftV;
                arr[sz++] = points[i + 4];
                arr[sz++] = points[i + 6];
                arr[sz++] = points[i + 7];
                arr[sz++] = textureId;
            }
        } else {
            //var tint = 0xffffffff;
            var tint = -1;
            for (i = 0;i<points.length;i += 9) {
                var eps = 0.5;
                textureId = (points[i+8] >> 2);
                shiftU = 1024 * (points[i+8] & 1);
                shiftV = 1024 * ((points[i+8] >> 1) & 1);
                var x = points[i+2], y = points[i+3];
                var w = points[i+4], h = points[i+5];
                var u = points[i] + shiftU, v = points[i+1] + shiftV;
                var animX = points[i+6], animY = points[i+7];
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
        gl.drawElements(gl.TRIANGLES, rectsCount * 6, gl.UNSIGNED_SHORT, 0);
};

module.exports = RectTileLayer;

},{}],5:[function(require,module,exports){
var shaderGenerator = require('./shaderGenerator');

function RectTileShader(gl, maxTextures)
{
    PIXI.Shader.call(this, gl,
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\n\nattribute vec2 aTextureCoord;\n\nattribute vec4 aFrame;\n\nattribute vec2 aAnim;\n\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\n\nuniform vec2 animationFrame;\n\nvarying vec2 vTextureCoord;\n\nvarying float vTextureId;\n\nvarying vec4 vFrame;\n\nvoid main(void){\n\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n   vec2 anim = aAnim * animationFrame;\n\n   vTextureCoord = aTextureCoord + anim;\n\n   vFrame = aFrame + vec4(anim, anim);\n\n   vTextureId = aTextureId;\n\n}\n\n",
        shaderGenerator.generateFragmentSrc(maxTextures, "#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n\nvarying vec4 vFrame;\n\nvarying float vTextureId;\n\nuniform vec4 shadowColor;\n\nuniform sampler2D uSamplers[%count%];\n\nuniform vec2 uSamplerSize[%count%];\n\nvoid main(void){\n\n   vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);\n\n   float textureId = floor(vTextureId + 0.5);\n\n   vec4 color;\n\n   %forloop%\n\n   gl_FragColor = color;\n\n}\n\n")
    );
    this.maxTextures = maxTextures;
    this.vertSize = 11;
    this.vertPerQuad = 4;
    this.stride = this.vertSize * 4;
    shaderGenerator.fillSamplers(this, this.maxTextures);
}

RectTileShader.prototype = Object.create(PIXI.Shader.prototype);
RectTileShader.prototype.constructor = RectTileShader;
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

module.exports = RectTileShader;

},{"./shaderGenerator":10}],6:[function(require,module,exports){
var shaderGenerator = require('./shaderGenerator');


function SquareTileShader(gl, maxTextures) {
    PIXI.Shader.call(this, gl,
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\n\nattribute vec2 aTextureCoord;\n\nattribute vec2 aAnim;\n\nattribute float aTextureId;\n\nattribute float aSize;\n\nuniform mat3 projectionMatrix;\n\nuniform vec2 samplerSize;\n\nuniform vec2 animationFrame;\n\nuniform float projectionScale;\n\nvarying vec2 vTextureCoord;\n\nvarying float vSize;\n\nvarying float vTextureId;\n\nvoid main(void){\n\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition + aSize * 0.5, 1.0)).xy, 0.0, 1.0);\n\n   gl_PointSize = aSize * projectionScale;\n\n   vTextureCoord = aTextureCoord + aAnim * animationFrame;\n\n   vTextureId = aTextureId;\n\n   vSize = aSize;\n\n}\n\n",
        shaderGenerator.generateFragmentSrc(maxTextures, "#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n\nvarying float vSize;\n\nvarying float vTextureId;\n\nuniform vec4 shadowColor;\n\nuniform sampler2D uSamplers[%count%];\n\nuniform vec2 uSamplerSize[%count%];\n\nuniform vec2 pointScale;\n\nvoid main(void){\n\n   float margin = 1.0/vSize;\n\n   vec2 clamped = vec2(clamp(gl_PointCoord.x, margin, 1.0 - margin), clamp(gl_PointCoord.y, margin, 1.0 - margin));\n\n   vec2 textureCoord = ((clamped-0.5) * pointScale + 0.5) * vSize + vTextureCoord;\n\n   float textureId = vTextureId;\n\n   vec4 color;\n\n   %forloop%\n\n   gl_FragColor = color;\n\n}\n\n")
    );
    this.maxTextures = maxTextures;
    this.vertSize = 8;
    this.vertPerQuad = 1;
    this.stride = this.vertSize * 4;
    shaderGenerator.fillSamplers(this, this.maxTextures);
}

SquareTileShader.prototype = Object.create(PIXI.Shader.prototype);
SquareTileShader.prototype.constructor = SquareTileShader;
SquareTileShader.prototype.createVao = function (renderer, vb) {
    var gl = renderer.gl;
    return renderer.createVao()
        .addIndex(this.indexBuffer)
        .addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
        .addAttribute(vb, this.attributes.aTextureCoord, gl.FLOAT, false, this.stride, 2 * 4)
        .addAttribute(vb, this.attributes.aSize, gl.FLOAT, false, this.stride, 4 * 4)
        .addAttribute(vb, this.attributes.aAnim, gl.FLOAT, false, this.stride, 5 * 4)
        .addAttribute(vb, this.attributes.aTextureId, gl.FLOAT, false, this.stride, 7 * 4);
};

module.exports = SquareTileShader;

},{"./shaderGenerator":10}],7:[function(require,module,exports){
var RectTileShader = require('./RectTileShader'),
    SquareTileShader = require('./SquareTileShader'),
    glCore = PIXI.glCore;

/*
* Renderer for square and rectangle tiles.
* Squares cannot be rotated, skewed.
* For container with squares, scale.x must be equals to scale.y, matrix.a to matrix.d
* Rectangles do not care about that.
*
* @class
* @memberof PIXI.tilemap
* @extends PIXI.ObjectRenderer
* @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
*/

function TileRenderer(renderer) {
    PIXI.ObjectRenderer.call(this, renderer);
    this.vbs = {};
    this.lastTimeCheck = 0;
    this.tileAnim = [0, 0];
    this.maxTextures = 4;
    this.indices = [];
}

TileRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
TileRenderer.prototype.constructor = TileRenderer;
TileRenderer.vbAutoincrement = 0;

TileRenderer.prototype.onContextChange = function() {
    var gl = this.renderer.gl;
    var maxTextures = this.maxTextures;
    this.rectShader = new RectTileShader(gl, maxTextures);
    this.squareShader = new SquareTileShader(gl, maxTextures);
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);
    this.checkIndexBuffer(2000);
    this.rectShader.indexBuffer = this.indexBuffer;
    this.squareShader.indexBuffer = this.indexBuffer;
    this.vbs = {};
    this.glTextures = [];
    this.boundSprites = [];
    this.initBounds();
};

TileRenderer.prototype.initBounds = function() {
    var gl = this.renderer.gl;
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = 2048;
    tempCanvas.height = 2048;
    // tempCanvas.getContext('2d').clearRect(0, 0, 2048, 2048);
    for (var i=0;i<this.maxTextures; i++) {
        var glt = new glCore.GLTexture(gl, 2048, 2048);
        glt.premultiplyAlpha = true;
        glt.upload(tempCanvas);
        glt.enableWrapClamp();
        glt.enableLinearScaling();
        this.glTextures.push(glt);
        var bs = [];
        for (var j=0;j<4;j++) {
            var spr = new PIXI.Sprite();
            spr.position.x = 1024 * (j & 1);
            spr.position.y = 1024 * (j >> 1);
            bs.push(spr);
        }
        this.boundSprites.push(bs);
    }
};

glCore.GLTexture.prototype._hackSubImage = function(sprite) {
    this.bind();
    var gl = this.gl;
    var baseTex = sprite.texture.baseTexture;
    gl.texSubImage2D(gl.TEXTURE_2D, 0, sprite.position.x, sprite.position.y, this.format, this.type, baseTex.source);
};

TileRenderer.prototype.bindTextures = function(renderer, textures) {
    var bounds = this.boundSprites;
    var glts = this.glTextures;
    var len = textures.length;
    var maxTextures = this.maxTextures;
    if (len >= 4 * maxTextures) {
        return;
    }
    var i;
    for (i=0;i<len;i++) {
        var texture = textures[i];
        renderer.bindTexture(texture);
        if (!texture || !textures[i].valid) continue;
        var bs = bounds[i >> 2][i & 3];
        if (bs.texture !== texture) {
            bs.texture = texture;
            var glt = glts[ i >> 2 ];
            glt._hackSubImage(bs);
        }
    }
    for (i = 0; i < maxTextures; i++) {
        glts[i].bind(i);
    }
    renderer._activeTextureLocation = maxTextures - 1;
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
    var stuff = {
        id: id,
        vb: vb,
        vao: shader.createVao(this.renderer, vb),
        lastTimeAccess: Date.now(),
        useSquare: useSquare,
        shader: shader
    };
    this.vbs[id] = stuff;
    return stuff;
};

TileRenderer.prototype.removeVb = function(id) {
    if (this.vbs[id]) {
        this.vbs[id].vb.destroy();
        this.vbs[id].vao.destroy();
        delete this.vbs[id];
    }
};

TileRenderer.prototype.checkIndexBuffer = function(size) {
    // the total number of indices in our array, there are 6 points per quad.
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

    // fill the indices with the quads to draw
    for (var i=0, j=0; i < totalIndices; i += 6, j += 4)
    {
        indices[i + 0] = j + 0;
        indices[i + 1] = j + 1;
        indices[i + 2] = j + 2;
        indices[i + 3] = j + 0;
        indices[i + 4] = j + 2;
        indices[i + 5] = j + 3;
    }

    this.indexBuffer.upload(indices);
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

module.exports = TileRenderer;

},{"./RectTileShader":5,"./SquareTileShader":6}],8:[function(require,module,exports){
function ZLayer() {
    this.initialize.apply(this, arguments);
}

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
    var i;
    if (!modified) {
        for (i=0;i<layers.length;i++) {
            if (layers[i].isModified(this._lastAnimationFrame != tilemap.animationFrame)) {
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
        for (i=0;i<layers.length;i++) {
            layers[i].clearModify();
            layers[i].renderCanvas(tempRender);
        }
    }
    this.layerTransform = this.worldTransform;
    for (i=0;i<layers.length;i++) {
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

module.exports = ZLayer;

},{}],9:[function(require,module,exports){
PIXI.tilemap = {
    ZLayer: require('./ZLayer'),
    GraphicsLayer: require('./GraphicsLayer'),
    RectTileLayer: require('./RectTileLayer'),
    CompositeRectTileLayer: require('./CompositeRectTileLayer'),
    CanvasTileRenderer: require('./CanvasTileRenderer'),
    TileRenderer: require('./TileRenderer')
};

module.exports = PIXI.tilemap;

},{"./CanvasTileRenderer":1,"./CompositeRectTileLayer":2,"./GraphicsLayer":3,"./RectTileLayer":4,"./TileRenderer":7,"./ZLayer":8}],10:[function(require,module,exports){
var shaderGenerator = {
    fillSamplers: function(shader, maxTextures) {
        var sampleValues = [];
        for (var i = 0; i < maxTextures; i++)
        {
            sampleValues[i] = i;
        }
        shader.bind();
        shader.uniforms.uSamplers = sampleValues;

        var samplerSize = [];
        for (i = 0; i < maxTextures; i++) {
            samplerSize.push(1.0 / 2048);
            samplerSize.push(1.0 / 2048);
        }
        shader.uniforms.uSamplerSize = samplerSize;
    },
    generateFragmentSrc: function(maxTextures, fragmentSrc) {
        return fragmentSrc.replace(/%count%/gi, maxTextures)
            .replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));
    },
    generateSampleSrc: function(maxTextures) {
        var src = '';

        src += '\n';
        src += '\n';

        src += 'if(vTextureId <= -1.0) {';
        src += '\n\tcolor = shadowColor;';
        src += '\n}';

        for (var i = 0; i < maxTextures; i++)
        {
            src += '\nelse ';

            if(i < maxTextures-1)
            {
                src += 'if(textureId == ' + i + '.0)';
            }

            src += '\n{';
            src += '\n\tcolor = texture2D(uSamplers['+i+'], textureCoord * uSamplerSize['+i+']);';
            src += '\n}';
        }

        src += '\n';
        src += '\n';

        return src;
    }
};

module.exports = shaderGenerator;

},{}]},{},[9])


//# sourceMappingURL=pixi-tilemap.js.map
