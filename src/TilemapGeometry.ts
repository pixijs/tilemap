import { Buffer, BufferUsage, Geometry } from 'pixi.js';

// For some reason, ESLint goes mad with indentation in this file ^&^
/* eslint-disable no-mixed-spaces-and-tabs, indent */

export class TilemapGeometry extends Geometry
{
    static vertSize = 13;
    static vertPerQuad = 4;
    static stride = this.vertSize * 4;
    lastTimeAccess = 0;

    vertSize = TilemapGeometry.vertSize;
    vertPerQuad = TilemapGeometry.vertPerQuad;
    stride = TilemapGeometry.stride;

    constructor(indexBuffer: Buffer)
    {
        const buf = new Buffer({
            data: new Float32Array(2),
            label: 'tilemap-buffer',
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
            shrinkToFit: false,
        });

        const stride = TilemapGeometry.stride;

	    super({
            indexBuffer,
            attributes: {
                aVertexPosition: {
                    buffer: buf,
                    format: 'float32x2',
                    stride,
                    offset: 0,
                    location: 0,
                },
                aTextureCoord: {
                    buffer: buf,
                    format: 'float32x2',
                    stride,
                    offset: 2 * 4,
                    location: 1,
                },
                aFrame: {
                    buffer: buf,
                    format: 'float32x4',
                    stride,
                    offset: 4 * 4,
                    location: 2,
                },
                aAnim: {
                    buffer: buf,
                    format: 'float32x2',
                    stride,
                    offset: 8 * 4,
                    location: 3,
                },
                aTextureId: {
                    buffer: buf,
                    format: 'float32',
                    stride,
                    offset: 10 * 4,
                    location: 4
                },
                aAnimDivisor: {
                    buffer: buf,
                    format: 'float32',
                    stride,
                    offset: 11 * 4,
                    location: 5
                },
                aAlpha: {
                    buffer: buf,
                    format: 'float32',
                    stride,
                    offset: 12 * 4,
                    location: 6
                }
            },
        });

        this.buf = buf;
    }

    buf: Buffer;
}
