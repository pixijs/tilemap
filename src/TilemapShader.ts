// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
///<reference path="../global.d.ts" />

import * as shaderGenerator from './shaderGenerator';
import tilemapShaderVertexSrc from './tilemap.vert';
import tilemapShaderFragmentSrc from './tilemap.frag';

import { Buffer, Geometry, Shader, Program } from '@pixi/core';
import { Matrix } from '@pixi/math';

// For some reason ESLint goes mad with indendation in this file ^&^
/* eslint-disable no-mixed-spaces-and-tabs, indent */

export abstract class TilemapShader extends Shader
{
	maxTextures = 0;

	constructor(maxTextures: number, shaderVert: string, shaderFrag: string)
	{
	    super(
	        new Program(shaderVert, shaderFrag),
	        {
	            animationFrame: new Float32Array(2),
	            uSamplers: [],
	            uSamplerSize: [],
	            projTransMatrix: new Matrix()
	        }
	    );

	    this.maxTextures = maxTextures;
	    shaderGenerator.fillSamplers(this, this.maxTextures);
	}
}

export class RectTileShader extends TilemapShader
{
    constructor(maxTextures: number)
    {
        super(
            maxTextures,
            tilemapShaderVertexSrc,
            shaderGenerator.generateFragmentSrc(maxTextures, tilemapShaderFragmentSrc)
        );
        shaderGenerator.fillSamplers(this, this.maxTextures);
    }
}

export class RectTileGeom extends Geometry
{
	vertSize = 11;
	vertPerQuad = 4;
	stride = this.vertSize * 4;
	lastTimeAccess = 0;

	constructor()
	{
	    super();

	    const buf = this.buf = new Buffer(new Float32Array(2), true, false);

	    this.addAttribute('aVertexPosition', buf, 0, false, 0, this.stride, 0)
	        .addAttribute('aTextureCoord', buf, 0, false, 0, this.stride, 2 * 4)
	        .addAttribute('aFrame', buf, 0, false, 0, this.stride, 4 * 4)
	        .addAttribute('aAnim', buf, 0, false, 0, this.stride, 8 * 4)
	        .addAttribute('aTextureId', buf, 0, false, 0, this.stride, 10 * 4);
	}

	buf: Buffer;
}
