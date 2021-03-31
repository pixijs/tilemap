// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
///<reference path="../global.d.ts" />

import * as shaderGenerator from './shaderGenerator';
import tilemapVertexTemplateSrc from './tilemap.vert';
import tilemapFragmentTemplateSrc from './tilemap.frag';

import { Buffer, Geometry, Shader, Program } from '@pixi/core';
import { Matrix } from '@pixi/math';

// For some reason ESLint goes mad with indendation in this file ^&^
/* eslint-disable no-mixed-spaces-and-tabs, indent */

export class TilemapShader extends Shader
{
	maxTextures = 0;

	constructor(maxTextures: number)
	{
	    super(
	        new Program(
				tilemapVertexTemplateSrc,
				shaderGenerator.generateFragmentSrc(maxTextures, tilemapFragmentTemplateSrc)
			),
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

export class TilemapGeometry extends Geometry
{
	vertSize = 13;
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
	        .addAttribute('aTextureId', buf, 0, false, 0, this.stride, 10 * 4)
            .addAttribute('aAnimDuration', buf, 0, false, 0, this.stride, 11 * 4)
            .addAttribute('aAlpha', buf, 0, false, 0, this.stride, 12 * 4);
	}

	buf: Buffer;
}
