// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
///<reference path="../global.d.ts" />

import * as shaderGenerator from './shaderGenerator';

const tilemapVertexTemplateSrc = `#version 100
precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aFrame;
attribute vec2 aAnim;
attribute float aAnimDivisor;
attribute float aTextureId;
attribute float aAlpha;

uniform mat3 projTransMatrix;
uniform vec2 animationFrame;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vFrame;
varying float vAlpha;

void main(void)
{
   gl_Position = vec4((projTransMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vec2 animCount = floor((aAnim + 0.5) / 2048.0);
   vec2 animFrameOffset = aAnim - animCount * 2048.0;
   vec2 currentFrame = floor(animationFrame / aAnimDivisor);
   vec2 animOffset = animFrameOffset * floor(mod(currentFrame + 0.5, animCount));

   vTextureCoord = aTextureCoord + animOffset;
   vFrame = aFrame + vec4(animOffset, animOffset);
   vTextureId = aTextureId;
   vAlpha = aAlpha;
}
`;

const tilemapFragmentTemplateSrc = `#version 100
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vTextureCoord;
varying vec4 vFrame;
varying float vTextureId;
varying float vAlpha;
uniform vec4 shadowColor;
uniform sampler2D uSamplers[%count%];
uniform vec2 uSamplerSize[%count%];

void main(void)
{
   vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);
   float textureId = floor(vTextureId + 0.5);

   vec4 color;
   %forloop%
   gl_FragColor = color * vAlpha;
}
`;

import { Buffer, Geometry, Shader, Program, Matrix } from '@pixi/core';

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
            .addAttribute('aAnimDivisor', buf, 0, false, 0, this.stride, 11 * 4)
            .addAttribute('aAlpha', buf, 0, false, 0, this.stride, 12 * 4);
	}

	buf: Buffer;
}
