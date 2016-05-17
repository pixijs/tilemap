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
        if (tileWidth % tileHeight === 0) {
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
    if (points.length === 0) return;

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
        var i;
        if (useSquare) {
            for (i = 0; i < points.length; i += 8) {
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
            for (i = 0;i<points.length;i += 8) {
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
};

module.exports = RectTileLayer;
